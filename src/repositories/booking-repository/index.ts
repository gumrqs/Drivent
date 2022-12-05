import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    },
    include: {
      Room: true
    }
  });
}
async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: {
      id
    }
  });
}

async function upsertBookingByUserId(userId: number, roomId: number, bookingId: number) {
  return prisma.booking.upsert({
    create: {
      userId: userId,
      roomId: roomId
    },
    update: {
      roomId: roomId
    },
    where: {
      id: bookingId
    }
  });
}

const bookingRepository = {
  findBookingByUserId,
  upsertBookingByUserId,
  findBookingById
};

export default bookingRepository;
