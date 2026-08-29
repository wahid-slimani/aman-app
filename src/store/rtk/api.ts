import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["AidPoint", "Organiser", "Report", "Dataset", "Analytics"],
  endpoints: (builder) => ({
    nearbyAidPoints: builder.query<unknown, { latitude: number; longitude: number; radius: number }>({
      query: ({ latitude, longitude, radius }) =>
        `aid-points/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      providesTags: ["AidPoint"]
    })
  })
});

export const { useNearbyAidPointsQuery } = api;
