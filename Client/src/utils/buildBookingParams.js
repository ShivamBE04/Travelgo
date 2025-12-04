export function buildBookingParams({ checkIn, checkOut, rooms, adults, kids, currency = "INR" }) {
  const params = new URLSearchParams();

  params.set("checkIn", checkIn);
  params.set("checkOut", checkOut);
  params.set("rooms", rooms);

  params.set("adults[1]", adults);
  params.set("children[1]", kids);

  params.set("currency", currency);

  return params.toString();
}
