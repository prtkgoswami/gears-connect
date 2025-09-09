// lib/api.ts
import { Meetup, UserProfile } from "../types/models";
import { getAuthHeaders } from "./authHeaders";

async function apiFetch<T>(url: string): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...headers, // safely merges {} or { Authorization: "Bearer ..." }
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchMeetups() {
  return apiFetch<Meetup[]>("/api/fetchMeetups");
}

export async function fetchMeetupList(ids: string[]) {
  const query = new URLSearchParams({ ids: ids.join(",") });
  return apiFetch<Meetup[]>(`/api/fetchMeetupsByIds/${ids.join(",")}`);
}

export async function fetchMeetup(id: string) {
  console.log("fetchMeetup", id)
  return apiFetch<Meetup>(`/api/fetchMeetupsByIds/${id}`);
}

export async function fetchUser(userId: string) {
  return apiFetch<UserProfile>(`/api/fetchUser/${userId}`);
}