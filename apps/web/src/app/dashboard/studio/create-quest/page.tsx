"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor";
import Image from "next/image";

const questSchema = z
  .object({
    // Step 1
    title: z.string().min(1, "Title is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .refine(
        (val) => val.replace(/<[^>]*>/g, "").trim().length > 0,
        "Description cannot be empty"
      ),
    periodStart: z.string().min(1, "Start date is required"),
    periodEnd: z.string().min(1, "End date is required"),
    thumbnail: z
      .any()
      .refine((files) => files && files.length > 0, "Thumbnail is required"),
    // Step 2
    network: z.string().min(1, "Network is required"),
    token: z.string().min(1, "Token is required"),
    token_amount_per_winner: z
      .string()
      .min(1, "Token amount is required")
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
        message: "Token amount must be a positive number",
      }),
    winners: z
      .string()
      .min(1, "Number of winners is required")
      .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
        message: "Winners must be a positive integer",
      }),
    distribution: z.enum(["raffle", "fcfs"], {
      required_error: "Distribution type is required",
    }),
  })
  .refine(
    (data) =>
      !data.periodStart ||
      !data.periodEnd ||
      new Date(data.periodEnd) >= new Date(data.periodStart),
    {
      message: "End date must be after start date",
      path: ["periodEnd"],
    }
  );

type QuestFormValues = z.infer<typeof questSchema>;

const STEP_LABELS = ["Quest Info", "Rewards Info"] as const;

export default function CreateQuestPage() {
  const [step, setStep] = useState<0 | 1>(0);

  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: "",
      description: "",
      periodStart: "",
      periodEnd: "",
      network: "",
      token: "",
      token_amount_per_winner: "",
      winners: "",
      distribution: undefined,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const thumbnailFiles = watch("thumbnail");

  const previewUrl = useMemo(() => {
    if (thumbnailFiles && thumbnailFiles.length > 0) {
      return URL.createObjectURL(thumbnailFiles[0]);
    }
    return null;
  }, [thumbnailFiles]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClearThumbnail = () => {
    setValue("thumbnail", undefined);
    const input = document.getElementById(
      "quest-thumbnail-input"
    ) as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const onSubmit = (values: QuestFormValues) => {
    // TODO: wire this to your API
    // For now, just log them
    // eslint-disable-next-line no-console
    console.log("Create quest", values);
  };

  const onSaveDraft = (values: QuestFormValues) => {
    // TODO: replace with actual draft persistence (e.g. localStorage / API)
    // eslint-disable-next-line no-console
    console.log("Save draft", values);
  };

  const goNext = () => {
    if (step === 0) {
      setStep(1);
    }
  };

  const goPrevious = () => {
    if (step === 1) {
      setStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e13] px-5 pb-20 pt-24 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl gap-8">
        {/* Stepper */}
        <aside className="hidden w-40 flex-col gap-6 md:flex">
          {STEP_LABELS.map((label, index) => {
            const isActive = step === index;
            const isCompleted = step > index;
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition
                  ${isActive
                      ? "border-blue-500 bg-blue-600 text-white"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-600 text-white"
                        : "border-white/20 bg-transparent text-white/60"
                    }`}
                >
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Form */}
        <main className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {step === 0 ? "Quest Info" : "Rewards Info"}
              </h1>
              <p className="mt-1 text-sm text-white/60">
                {step === 0
                  ? "Set up the basic information for your quest."
                  : "Configure rewards and distribution for your quest."}
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              className="border border-[#1A1A1A] rounded bg-black/40 text-xs text-white"
              onClick={handleSubmit(onSaveDraft)}
            >
              Save Draft
            </Button>
          </div>

          <form
            className="space-y-10 rounded border border-white/10 bg-linear-to-b from-zinc-950/80 to-black/80 p-6 shadow-xl"
            onSubmit={handleSubmit(onSubmit)}
          >
            {step === 0 ? (
              <section className="space-y-6">
                <FieldGroup>
                  {/* Title */}
                  <Controller
                    name="title"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Title <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="Quest title"
                          className="bg-black/40 text-sm text-white placeholder:text-white/30 rounded border border-[#1A1A1A]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Description */}
                  <Field data-invalid={!!errors.description}>
                    <FieldLabel>
                      Description <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div>
                      <RichTextEditor />
                    </div>
                    {errors.description && (
                      <FieldError errors={[errors.description]} />
                    )}
                  </Field>

                  {/* Quest period */}
                  <Field>
                    <FieldLabel>
                      Quest Period <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Controller
                        name="periodStart"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldDescription className="text-xs text-white/60">
                              Start date
                            </FieldDescription>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="default"
                                  id="quest-period-start"
                                  aria-invalid={fieldState.invalid}
                                  className="flex w-full items-center justify-start border border-[#1A1A1A] rounded bg-black/40 text-left text-sm font-normal text-white"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? new Date(field.value).toLocaleDateString()
                                    : "Select start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden border border-[#1A1A1A] p-0 bg-black text-white"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value ? new Date(field.value) : undefined
                                  }
                                  captionLayout="dropdown"
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? date.toISOString() : ""
                                    )
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="periodEnd"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldDescription className="text-xs text-white/60">
                              End date
                            </FieldDescription>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="default"
                                  id="quest-period-end"
                                  aria-invalid={fieldState.invalid}
                                  className="flex w-full items-center justify-start border border-[#1A1A1A] rounded bg-black/40 text-left text-sm font-normal text-white"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? new Date(field.value).toLocaleDateString()
                                    : "Select end date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden border border-white/10 p-0 bg-black text-white"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value ? new Date(field.value) : undefined
                                  }
                                  captionLayout="dropdown"
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? date.toISOString() : ""
                                    )
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </Field>

                  {/* Thumbnail */}
                  <Controller
                    name="thumbnail"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Thumbnail <span className="text-red-500">*</span>
                        </FieldLabel>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            variant="default"
                            className="bg-black border border-[#1A1A1A] rounded text-white"
                            onClick={() =>
                              document
                                .getElementById("quest-thumbnail-input")
                                ?.click()
                            }
                          >
                            {previewUrl ? "Change image" : "Upload image"}
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Input
                            id="quest-thumbnail-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              field.onChange(e.target.files ?? undefined)
                            }
                          />
                          {previewUrl && (
                            <div className="relative h-16 w-28 overflow-hidden rounded border border-white/15 bg-black/60">
                              <button
                                type="button"
                                onClick={handleClearThumbnail}
                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white/80 hover:bg-black hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <Image
                                src={previewUrl}
                                alt="Thumbnail preview"
                                className="h-full w-full object-cover"
                                width={100}
                                height={100}
                              />
                            </div>
                          )}
                        </div>
                        <FieldDescription className="text-xs text-white/40">
                          Recommended 800x400px or similar 2:1 ratio, JPG or
                          PNG.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </section>
            ) : (
              <section className="space-y-6">
                <FieldGroup>
                  {/* Token info */}
                  <Field>
                    <FieldLabel>
                      Token Info <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Controller
                        name="network"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="border border-[#1A1A1A] rounded bg-black/40 text-white">
                                <SelectValue placeholder="Select network" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ethereum">
                                  Ethereum
                                </SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                                <SelectItem value="bsc">BSC</SelectItem>
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="token"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="border border-[#1A1A1A] rounded bg-black/40 text-white">
                                <SelectValue placeholder="Select token" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="medq">MEDQ</SelectItem>
                                <SelectItem value="usdc">USDC</SelectItem>
                                <SelectItem value="custom">
                                  Custom token
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </Field>

                  {/* Token amount */}
                  <Controller
                    name="token_amount_per_winner"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Token Amount (per winner){" "}
                          <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          step="0.0001"
                          min={0}
                          placeholder="Enter amount, up to 4 decimal places"
                          className="border border-[#1A1A1A] rounded bg-black/40 text-white"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Winners */}
                  <Controller
                    name="winners"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Amount of Winners{" "}
                          <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          placeholder="How many winners do you want to select?"
                          className="border border-[#1A1A1A] rounded bg-black/40 text-white"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Distribution */}
                  <Controller
                    name="distribution"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Reward Distribution{" "}
                          <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="border border-[#1A1A1A] rounded bg-black/40 text-white">
                            <SelectValue placeholder="Select distribution" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="raffle">Raffle</SelectItem>
                            <SelectItem value="fcfs">
                              First-come, first-served (FCFS)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </section>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="default"
                onClick={goPrevious}
                disabled={step === 0}
                className="text-white border border-[#1A1A1A] rounded bg-[#BF092F] hover:bg-[#BF092F]/80"
              >
                Previous
              </Button>

              {step === 0 ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={goNext}
                  className="text-white border border-[#1A1A1A] rounded bg-[#2845D6] hover:bg-[#2845D6]/80"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  className="text-white border border-[#1A1A1A] rounded bg-[#48A111] hover:bg-[#48A111]/80"
                >
                  Publish Quest
                </Button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
