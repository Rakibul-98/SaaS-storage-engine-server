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

const getAllPackages = async () => {
  return prisma.subscriptionPackage.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

const getSinglePackage = async (id: string) => {
  const result = await prisma.subscriptionPackage.findFirst({
    where: { id, isDeleted: false },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  }

  return result;
};

const updatePackage = async (id: string, payload: any) => {
  await getSinglePackage(id);

  return prisma.subscriptionPackage.update({
    where: { id },
    data: payload,
  });
};

const deletePackage = async (id: string) => {
  await getSinglePackage(id);

  return prisma.subscriptionPackage.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const SubscriptionService = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
};
