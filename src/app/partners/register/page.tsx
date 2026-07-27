"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function PartnerRegisterPage() {
  const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setMessage("");const data=Object.fromEntries(new FormData(event.currentTarget));const r=await fetch("/api/partners/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const j=await r.json();setMessage(r.ok?"Application received. We’ll activate your account after review; then you can sign in.":j.error);setLoading(false);}
  return <main className="min-h-screen bg-slate-50 p-5 grid place-items-center"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm space-y-4"><div><h1 className="text-2xl font-bold text-navy">Join the Prepcore partner program</h1><p className="mt-1 text-sm text-slate-500">Earn ₦600 for each student you refer who pays for Pro.</p></div><div><Label>Full name</Label><Input required name="full_name" /></div><div><Label>Email address</Label><Input required type="email" name="email" /></div><div><Label>Phone number</Label><Input required name="phone" /></div><div><Label>Business / organisation (optional)</Label><Input name="business_name" /></div><div><Label>City (optional)</Label><Input name="city" /></div><div><Label>Password</Label><Input required minLength={8} type="password" name="password" /></div><Button className="w-full" disabled={loading}>{loading?"Submitting…":"Submit application"}</Button>{message&&<p className="text-sm text-slate-600">{message}</p>}<p className="text-center text-sm text-slate-500">Already registered? <Link className="text-primary font-medium" href="/partners/login">Sign in</Link></p></form></main>;
}
