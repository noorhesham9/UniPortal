const API_URL = "http://localhost:3000/api/v1/semesters";

export const createSemester = async (data) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getAllSemesters = async () => {
    const res = await fetch(API_URL);
    return res.json();
};

export const updateSemester = async (id, data) => {
    const res = await fetch(API_URL + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteSemester = async (id) => {
    const res = await fetch(API_URL + "/" + id, {
        method: "DELETE",
    });
    return res.json();
};