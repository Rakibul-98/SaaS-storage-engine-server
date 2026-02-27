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
      id: payload.subscriptionPackageId,
      isDeleted: false,
    },
  });

  if (!subscriptionPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription package not found");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const [newSubscription] = await prisma.$transaction([
    prisma.userSubscription.updateMany({
      where: {
        userId,
        isActive: true,
        isDeleted: false,
      },
      data: {
        isActive: false,
      },
    }),
    prisma.userSubscription.create({
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
    }),
  ]);

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

const getMySubscriptionHistory = async (userId: string) => {
  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId, isDeleted: false },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      isActive: true,
      package: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return subscriptions;
};

export const UserSubscriptionService = {
  createSubscription,
  getMyActiveSubscription,
  getMySubscriptionHistory,
};
