import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, requestError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";
import { forbidden } from "joi";

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw requestError(404, "notfound");
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function findBooking(userId: number) {
  await listHotels(userId);

  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();  
  }
  return { id: booking.id, Room: booking.Room };
}

async function insertedBooking(userId: number, roomId: number) {
  await listHotels(userId);

  const room = await hotelRepository.findRoomById(roomId);

  if(!room) {
    throw requestError(404, "notfound");
  }
  if(room.capacity ===0) {
    throw requestError(403, "forbidden");
  }
  const booking = await bookingRepository.upsertBookingByUserId(userId, roomId, 0);

  if (!booking) {
    throw requestError(404, "notfound");
  }
  return { bookingId: booking.id };
}
async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await listHotels(userId);

  const room = await hotelRepository.findRoomById(roomId);

  if(!room) {
    throw requestError(404, "notfound");
  }
  if(room.capacity ===0) {
    throw requestError(403, "forbidden");
  }
  await bookingRepository.upsertBookingByUserId(userId, roomId, bookingId);

  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw requestError(403, "notfound");
  }
  return { bookingId: booking.id };
}

const bookingService = {
  findBooking,
  insertedBooking,
  updateBooking
};

export default bookingService;
