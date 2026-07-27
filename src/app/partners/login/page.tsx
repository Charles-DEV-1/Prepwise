"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function PartnerLoginPage(){const router=useRouter();const [error,setError]=useState("");const [loading,setLoading]=useState(false);async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);const r=await fetch("/api/partners/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});const j=await r.json();setLoading(false);if(r.ok)router.push("/partners/dashboard");else setError(j.error);}return <main className="min-h-screen bg-slate-50 p-5 grid place-items-center"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm space-y-4"><h1 className="text-2xl font-bold text-navy">Partner sign in</h1><div><Label>Email</Label><Input type="email" name="email" required /></div><div><Label>Password</Label><Input type="password" name="password" required /></div><Button className="w-full" disabled={loading}>{loading?"Signing in…":"Sign in"}</Button>{error&&<p className="text-sm text-red-600">{error}</p>}<p className="text-center text-sm text-slate-500">New partner? <Link className="font-medium text-primary" href="/partners/register">Apply here</Link></p></form></main>}
