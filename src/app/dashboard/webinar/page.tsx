"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DateTime } from "luxon";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminWebinarPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    australiaTimeZone: "",
    meetLink: "",
    recordingLink: "",
    startDateTime: "",
  });

  const fetchWebinars = async () => {
    try {
      const res = await fetch(`${API}/api/webinars`);
      if (!res.ok) return;
      const data = await res.json();
      setWebinars(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { startDateTime, australiaTimeZone, ...rest } = form;

      const selectedZone = TIMEZONES.find(
        (tz) => tz.value === australiaTimeZone,
      )?.zone;

      if (!selectedZone) {
        toast.error("Invalid Timezone");
        setLoading(false);
        return;
      }

      const zonedDate = DateTime.fromISO(startDateTime, {
        zone: selectedZone,
      });

      const utcDate = zonedDate.toUTC().toISO();

      const payload = {
        ...rest,
        australiaTimeZone,
        startDateTime: utcDate,
      };

      const res = await fetch(`${API}/api/webinars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Webinar Created Successfully");

      setForm({
        title: "",
        description: "",
        startDateTime: "",
        australiaTimeZone: "",
        meetLink: "",
        recordingLink: "",
      });

      fetchWebinars();
    } catch (error) {
      toast.error("Error creating webinar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/api/webinars/${id}`, {
        method: "DELETE",
      });

      toast.success("Webinar Deleted");
      fetchWebinars();
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const TIMEZONES = [
    {
      value: "AWST",
      label: "Australian Western Standard Time (AWST) – UTC+8",
      zone: "Australia/Perth",
    },
    {
      value: "ACST",
      label: "Australian Central Standard Time (ACST) – UTC+9:30",
      zone: "Australia/Darwin",
    },
    {
      value: "ACDT",
      label: "Australian Central Daylight Time (ACDT) – UTC+10:30",
      zone: "Australia/Adelaide",
    },
    {
      value: "AEST",
      label: "Australian Eastern Standard Time (AEST) – UTC+10",
      zone: "Australia/Brisbane",
    },
    {
      value: "AEDT",
      label: "Australian Eastern Daylight Time (AEDT) – UTC+11",
      zone: "Australia/Sydney",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Manage Webinars
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Create New Webinar</h2>

          <input
            type="text"
            name="title"
            placeholder="Webinar Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />

          <select
            name="australiaTimeZone"
            value={form.australiaTimeZone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg"
          >
            <option value="">Select Time Zone</option>

            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>

          {/* Date & Time */}
          <input
            type="datetime-local"
            name="startDateTime"
            value={form.startDateTime}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="text"
            name="meetLink"
            placeholder="Google Meet Link"
            value={form.meetLink}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="text"
            name="recordingLink"
            placeholder="Recording Link (Optional)"
            value={form.recordingLink}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            {loading ? "Creating..." : "Create Webinar"}
          </button>
        </form>

        {/* ===================== */}
        {/* WEBINAR LIST */}
        {/* ===================== */}
        <div className="mt-12 space-y-6">
          {webinars.map((webinar) => (
            <div
              key={webinar._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <p>
                <strong>Title:</strong> {webinar.title}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(webinar.startDateTime).toLocaleString("en-AU")}
              </p>
              <p>
                <strong>Base Timezone:</strong> {webinar.australiaTimeZone}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => handleDelete(webinar._id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
