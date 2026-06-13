"use client";

import { FormEvent, useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Campaign, Donation, User } from "@/types";

export default function DonationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donationForm, setDonationForm] = useState({ donation_type: "money", amount: "1000", item_description: "", campaign_id: "" });
  const [campaignForm, setCampaignForm] = useState({ title: "", description: "", cause: "", goal_amount: "50000" });

  useEffect(() => {
    api.me().then(setUser);
    api.listDonations().then(setDonations);
    api.listCampaigns().then(setCampaigns);
  }, []);

  async function submitDonation(e: FormEvent) {
    e.preventDefault();
    const created = await api.createDonation({
      donation_type: donationForm.donation_type,
      amount: Number(donationForm.amount),
      item_description: donationForm.item_description || undefined,
      campaign_id: donationForm.campaign_id ? Number(donationForm.campaign_id) : undefined,
    });
    setDonations((prev) => [created, ...prev]);
    setCampaigns(await api.listCampaigns());
  }

  async function submitCampaign(e: FormEvent) {
    e.preventDefault();
    const created = await api.createCampaign({
      title: campaignForm.title,
      description: campaignForm.description,
      cause: campaignForm.cause,
      goal_amount: Number(campaignForm.goal_amount),
    });
    setCampaigns((prev) => [created, ...prev]);
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <h1 className="text-3xl font-bold">Donations & Fundraising</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={submitDonation} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Make a donation</h2>
            <div className="mt-4 space-y-3">
              <select value={donationForm.donation_type} onChange={(e) => setDonationForm({ ...donationForm, donation_type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="money">Money</option><option value="food">Food</option><option value="medicine">Medicine</option><option value="clothing">Clothing</option>
              </select>
              <input type="number" placeholder="Amount (BDT)" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <select value={donationForm.campaign_id} onChange={(e) => setDonationForm({ ...donationForm, campaign_id: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">General donation</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <button type="submit" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Donate</button>
          </form>

          {(user?.role === "ngo" || user?.role === "admin") && (
            <form onSubmit={submitCampaign} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Create fundraising campaign</h2>
              <div className="mt-4 space-y-3">
                <input required placeholder="Title" value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input required placeholder="Cause" value={campaignForm.cause} onChange={(e) => setCampaignForm({ ...campaignForm, cause: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <textarea required placeholder="Description" value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input required type="number" placeholder="Goal amount" value={campaignForm.goal_amount} onChange={(e) => setCampaignForm({ ...campaignForm, goal_amount: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Create campaign</button>
            </form>
          )}
        </div>

        <section>
          <h2 className="font-semibold">Active campaigns</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-medium">{c.title}</h3>
                <p className="text-sm text-slate-600">{c.description}</p>
                <p className="mt-2 text-sm font-semibold text-red-600">৳{c.raised_amount.toLocaleString()} / ৳{c.goal_amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold">Your donations</h2>
          <div className="mt-4 space-y-2">
            {donations.map((d) => (
              <div key={d.id} className="rounded-lg border bg-white p-4 text-sm">{d.donation_type} · ৳{d.amount ?? 0} {d.allocated_to ? `→ ${d.allocated_to}` : ""}</div>
            ))}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
