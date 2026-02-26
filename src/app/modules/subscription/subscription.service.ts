import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";

const createPackage = async (payload: any) => {
  const existing = await prisma.subscriptionPackage.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Package with this name already exists",
    );
  }

  return prisma.subscriptionPackage.create({
    data: payload,
  });
};

export const SubscriptionService = {
  createPackage,
};
