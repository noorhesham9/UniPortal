import api from "./api";

export const getRooms = async ({ page = 1, limit = 10, search = "", type = "", is_active = "", sort = "room_name", order = "asc" } = {}) => {
  const params = new URLSearchParams({ page, limit, sort, order });
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  if (is_active !== "") params.append("is_active", is_active);
  const res = await api.get(`/rooms?${params}`);
  return res.data;
};

export const createRoom = async (data) => {
  const res = await api.post("/rooms", data);
  return res.data;
};

export const updateRoom = async (id, data) => {
  const res = await api.patch(`/rooms/${id}`, data);
  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/rooms/${id}`);
  return res.data;
};
