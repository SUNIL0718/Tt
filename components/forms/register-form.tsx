"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser } from "@/actions/register";
import Link from "next/link";

import { ActionState } from "@/lib/types";

const initialState: ActionState = {
  message: "",
  errors: {},
  success: false
};

export default function RegisterForm() {
  const [state, dispatch] = useActionState(registerUser, initialState);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">
          Create an Account
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="name"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>
             {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
            </div>
             {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
            {state?.message === "Email already exists." && (
               <p className="text-sm text-red-500">{state.message}</p>
            )}
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
             {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password}</p>
            )}
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="organizationName"
            >
              Organization Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="organizationName"
                type="text"
                name="organizationName"
                placeholder="e.g. Springfield High School"
                required
              />
            </div>
             {state?.errors?.organizationName && (
              <p className="text-sm text-red-500">{state.errors.organizationName}</p>
            )}
          </div>
        </div>
        <RegisterButton />
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {state?.message && state.message !== "Email already exists." && (
            <>
              <p className="text-sm text-red-500">{state.message}</p>
            </>
          )}
        </div>
        <div className="mt-4 text-center text-sm">
            Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
        </div>
      </div>
    </form>
  );
}

function RegisterButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      aria-disabled={pending}
    >
      Create Account
    </button>
  );
}
