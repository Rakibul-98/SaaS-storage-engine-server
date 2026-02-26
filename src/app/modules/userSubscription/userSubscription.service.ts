import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { TCreateUserSubscriptionPayload } from "./userSubscription.types";
import { prisma } from "../../shared/prisma";

const createSubscription = async (
  userId: string,
  payload: TCreateUserSubscriptionPayload,
) => {
  const subscriptionPackage = await prisma.subscriptionPackage.findFirst({
    where: {
      id: payload.packageId,
      isDeleted: false,
    },
  });

  if (!subscriptionPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription package not found");
  }

  await prisma.userSubscription.updateMany({
    where: {
      userId,
      isActive: true,
      isDeleted: false,
    },
    data: {
      isActive: false,
    },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const newSubscription = await prisma.userSubscription.create({
    data: {
      userId,
      packageId: subscriptionPackage.id,
      startDate,
      endDate,
      isActive: true,
    },
    include: {
      package: true,
    },
  });

  return newSubscription;
};

const getMyActiveSubscription = async (userId: string) => {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      isActive: true,
      isDeleted: false,
    },
    include: {
      package: true,
    },
  });

  return subscription;
};

export const UserSubscriptionService = {
  createSubscription,
  getMyActiveSubscription,
};
