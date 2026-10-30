// Backend/services/fineService.js
import FineConfig from "../models/FineConfig.js";
import Fine from "../models/Fine.js";
import Member from "../models/Member.js";

// 1) Get the active fine configuration
export async function getActiveFineConfig() {
  const cfg = await FineConfig.findOne({ isActive: true }).sort({
    createdAt: -1,
  });
  return cfg;
}

// 2) Minute-based fine computation (for fast testing)
//    Treat fineConfig.finePerDay as "fine per minute" during testing
export function computeFine(dueDate, returnedAt, fineConfig) {
  const dDue = new Date(dueDate);
  const dReturn = new Date(returnedAt);

  // No fine if not returned or returned on/before due
  if (!returnedAt || dReturn <= dDue) {
    return { minutesOverdue: 0, daysOverdue: 0, amount: 0 };
  }

  const msPerMinute = 60 * 1000;

  // Total minutes overdue
  const rawMinutes = Math.ceil((dReturn - dDue) / msPerMinute);

  // Grace in minutes (0 = every minute counts)
  const graceMinutes = 0;
  const minutesOverdue = Math.max(0, rawMinutes - graceMinutes);

  if (minutesOverdue <= 0) {
    return { minutesOverdue: 0, daysOverdue: 0, amount: 0 };
  }

  // finePerDay interpreted as per-minute rate for testing
  const perMinute = fineConfig.finePerDay;
  let amount = minutesOverdue * perMinute;

  // Apply maxFinePerItem cap if configured
  if (fineConfig.maxFinePerItem != null) {
    amount = Math.min(amount, fineConfig.maxFinePerItem);
  }

  // Derived days just for compatibility with schema
  const daysOverdue = Math.ceil(minutesOverdue / (60 * 24));

  return { minutesOverdue, daysOverdue, amount };
}

// 3) Create a Fine when a book is returned
export async function createFineForReturn({
  memberId,
  borrowRecordId,
  dueDate,
  returnedAt,
}) {
  console.log("DEBUG createFineForReturn called with:", {
    memberId,
    borrowRecordId,
    dueDate,
    returnedAt,
  });

  const cfg = await getActiveFineConfig();
  console.log("DEBUG active fine config:", cfg);

  if (!cfg) {
    console.log("DEBUG no active FineConfig, skipping fine creation");
    return null;
  }

  const { minutesOverdue, daysOverdue, amount } = computeFine(
    dueDate,
    returnedAt,
    cfg
  );
  console.log("DEBUG computeFine result:", {
    minutesOverdue,
    daysOverdue,
    amount,
  });

  if (amount <= 0) {
    console.log("DEBUG fine amount <= 0, skipping create");
    return null;
  }

  const fine = await Fine.create({
    member: memberId,
    borrowRecord: borrowRecordId,
    daysOverdue,
    finePerDay: cfg.finePerDay, // per-minute during testing
    amount,
    configName: cfg.name,
  });

  console.log("DEBUG Fine created:", fine._id);

  // Optional: update Member totals
  try {
    await Member.findByIdAndUpdate(memberId, {
      $inc: { totalOutstandingFine: amount },
    });
  } catch (e) {
    console.log("DEBUG Member update failed/ignored:", e.message);
  }

  return fine;
}

// 4) Pay / partially pay a fine
export async function payFine(fineId, amountToPay) {
  const fine = await Fine.findById(fineId);
  if (!fine) throw new Error("Fine not found");

  const remaining = fine.amount - fine.paidAmount;
  const pay = Math.min(remaining, amountToPay);

  fine.paidAmount += pay;
  fine.status = fine.paidAmount >= fine.amount ? "PAID" : "PARTIAL";
  await fine.save();

  try {
    await Member.findByIdAndUpdate(fine.member, {
      $inc: {
        totalOutstandingFine: -pay,
        totalPaidFine: pay,
      },
    });
  } catch (e) {
    console.log("DEBUG Member payment update failed/ignored:", e.message);
  }

  return fine;
}
