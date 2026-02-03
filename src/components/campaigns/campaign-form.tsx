"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customers } from "@/data/customers";
import { agents } from "@/data/agents";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export interface CampaignFormInitialData {
  campaignName?: string;
  callType?: string;
  list?: string;
  agent?: string;
  maxDailyMinutes?: number;
  workingDays?: string[];
  workingFrom?: string;
  workingTo?: string;
  maxRetries?: number;
  retryAfterMinutes?: number;
  metaData?: { key: string; value: string }[];
}

interface CampaignFormProps {
  mode: "create" | "edit";
  initialData?: CampaignFormInitialData;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CampaignForm({ mode, initialData }: CampaignFormProps) {
  const [campaignName, setCampaignName] = useState(
    initialData?.campaignName ?? "",
  );
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [list, setList] = useState(initialData?.list ?? "");
  const [agent, setAgent] = useState(initialData?.agent ?? "");
  const [maxDailyMinutes, setMaxDailyMinutes] = useState<number | "">(
    initialData?.maxDailyMinutes ?? "",
  );
  const [workingDays, setWorkingDays] = useState<string[]>(
    initialData?.workingDays ?? [],
  );
  const [workingFrom, setWorkingFrom] = useState(
    initialData?.workingFrom ?? "09:00",
  );
  const [workingTo, setWorkingTo] = useState(
    initialData?.workingTo ?? "17:00",
  );
  const [maxRetries, setMaxRetries] = useState<number | "">(
    initialData?.maxRetries ?? "",
  );
  const [retryAfterMinutes, setRetryAfterMinutes] = useState<number | "">(
    initialData?.retryAfterMinutes ?? "",
  );
  const [metaData, setMetaData] = useState<{ key: string; value: string }[]>(
    initialData?.metaData ?? [{ key: "", value: "" }],
  );

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const addMetaRow = () => {
    setMetaData((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeMetaRow = (index: number) => {
    setMetaData((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMetaRow = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setMetaData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const heading = mode === "create" ? "Create Campaign" : "Edit Campaign";
  const saveLabel = mode === "create" ? "Save Campaign" : "Save Changes";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Section 1: Basic Settings */}
          <Section
            title="Basic Settings"
            description="Set up the campaign name and call type."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Call Type</Label>
                <Select value={callType} onValueChange={setCallType} disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g. Q1 Lead Outreach"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Section 2: Configuration */}
          <Section
            title="Configuration"
            description="Choose the customer list, agent, and daily limits."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>List</Label>
                <Select value={list} onValueChange={setList}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer list" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__create__" disabled>
                      <Link
                        href="/customers"
                        className="text-primary underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        + Create List
                      </Link>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Need a new list?{" "}
                  <Link href="/customers" className="text-primary underline">
                    Create List
                  </Link>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={agent} onValueChange={setAgent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Need a new agent?{" "}
                  <Link
                    href="/agents/createAgent"
                    className="text-primary underline"
                  >
                    Create Agent
                  </Link>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-daily-minutes">Maximum Daily Minutes</Label>
                <Input
                  id="max-daily-minutes"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={maxDailyMinutes}
                  onChange={(e) =>
                    setMaxDailyMinutes(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Cannot be less than 0 and 0 is unlimited.
                </p>
              </div>
            </div>
          </Section>

          {/* Section 5: Meta Data */}
          <Section
            title="Meta Data"
            description="Add custom key-value pairs to this campaign."
          >
            <div className="space-y-3">
              {metaData.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) =>
                      updateMetaRow(index, "key", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) =>
                      updateMetaRow(index, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => removeMetaRow(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMetaRow}>
                <Plus className="mr-2 h-4 w-4" />
                Add More
              </Button>
            </div>
          </Section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Section 3: Working Hours */}
          <Section
            title="Working Hours"
            description="Define the days and times the campaign is active."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="grid grid-cols-4 gap-3">
                  {DAYS.map((day) => (
                    <FieldLabel key={day}>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={workingDays.includes(day)}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        <FieldContent>
                          <FieldTitle>{day}</FieldTitle>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="working-from">From</Label>
                  <Input
                    id="working-from"
                    type="time"
                    value={workingFrom}
                    onChange={(e) => setWorkingFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working-to">To</Label>
                  <Input
                    id="working-to"
                    type="time"
                    value={workingTo}
                    onChange={(e) => setWorkingTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4: Retries */}
          <Section
            title="Retries"
            description="Configure retry behavior for unanswered calls."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-retries">Maximum Retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={maxRetries}
                  onChange={(e) =>
                    setMaxRetries(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry-after">Retry After Minutes</Label>
                <Input
                  id="retry-after"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={retryAfterMinutes}
                  onChange={(e) =>
                    setRetryAfterMinutes(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button>{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}
