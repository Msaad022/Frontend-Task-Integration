"use client";

import { useState, useRef, useCallback, useReducer } from "react";
import { ChevronDown, Upload, X, FileText, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { customFakeFetch } from "@/lib/utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file?: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">{badge} required</Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}
// ------------------
type DropdownState = {
  data: any[];
  isLoading: boolean;
  error: string | null;
};

type State = {
  [key: string]: DropdownState;
};

type Action =
  | { type: "FETCH_START"; dropdown: string }
  | { type: "FETCH_SUCCESS"; dropdown: string; payload: any[] }
  | { type: "FETCH_ERROR"; dropdown: string; payload: string };

const initialState: State = {};
/**
 * dropdownReducer is a reducer function that manages the state of multiple dropdowns in the AgentForm component.
 */
function dropdownReducer(state: State, action: Action): State {
  const { dropdown } = action;

  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        [dropdown]: {
          ...(state[dropdown] || { data: [] }),
          isLoading: true,
          error: null,
        },
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        [dropdown]: {
          isLoading: false,
          data: action.payload,
          error: null,
        },
      };
    case "FETCH_ERROR":
      return {
        ...state,
        [dropdown]: {
          ...(state[dropdown] || { data: [] }),
          isLoading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
}
/**
 * SelectDropdown component is a reusable dropdown component that fetches its options from an API when opened.
 */
interface SelectDropdownProps {
  lable: string;
  root: string;
  dropdown: DropdownState;
  state: any;
  setState: any;
  fetchDropdownHandler: (open: boolean, dropdown: string) => Promise<void>;
}

const SelectDropdown = ({
  lable,
  root,
  dropdown,
  state,
  setState,
  fetchDropdownHandler,
}: SelectDropdownProps) => {
  return (
    <>
      <Label>
        {lable} <span className="text-destructive">*</span>
        {dropdown?.isLoading && (
          <Badge variant="outline" className="ml-2">
            Loading...{" "}
          </Badge>
        )}
      </Label>
      <Select
        value={state}
        onOpenChange={(open) => fetchDropdownHandler(open, root)}
        onValueChange={setState}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {dropdown?.data.map((item: any) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
              {lable == "Voice" && (
                <Badge variant="outline" className="ml-2 ms-auto">
                  {item.tag}
                </Badge>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {dropdown?.error && (
        <p className="text-sm text-destructive">
          Error loading languages: {dropdown.error}
        </p>
      )}
    </>
  );
};

const uploadWithProgress = (
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ key: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log("Upload response data:", data);
          resolve(data);
        } catch {
          reject(new Error(`Failed to parse response: ${xhr.responseText}`));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject();
    xhr.send(file);
  });
};

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // Form state — initialized from initialData when provided
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  /**
   * Dropdown state management using useReducer to handle multiple dropdowns with shared logic for fetching data, loading states, and error handling.
   * The state structure allows us to easily manage the state of each dropdown independently while keeping the logic centralized in the reducer.
   */
  const [stateR, dispatch] = useReducer(dropdownReducer, initialState);
  let { languages, voices, prompts, models } = stateR;

  const fetchDropdownHandler = async (open: boolean, dropdown: string) => {
    if (!open) return;
    if (stateR[dropdown]?.data.length) return; // data already fetched, no need to fetch again
    dispatch({ type: "FETCH_START", dropdown });

    try {
      const response = await customFakeFetch(dropdown);
      dispatch({ type: "FETCH_SUCCESS", dropdown, payload: response });
    } catch (error: any) {
      dispatch({ type: "FETCH_ERROR", dropdown, payload: error.message });
    }
  };

  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(
    initialData?.serviceDescription ?? "",
  );

  // Reference Data
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [attachments, setAttachments] = useState<number[]>([]);

  // Badge counts for required fields
  const basicSettingsMissing = [
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
  ].filter((v) => !v).length;

  // File upload handlers
  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      // Create a unique ID using name and a random string
      const fileId = `${file.name}-${Math.random().toString(36).slice(2)}`;

      // Add file to state with pending status
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: file.size,
          status: "pending",
          progress: 0,
        },
      ]);

      try {
        // --- Step 1: Request Signed URL ---
        const { signedUrl } = await customFakeFetch("attachments/upload-url", {
          method: "POST",
        });

        // 2. Update status to uploading now that we have the URL
        setUploadedFiles((prev) =>
          prev.map((u) =>
            u.id === fileId ? { ...u, status: "uploading" } : u,
          ),
        );

        // --- Step 2: Upload via XHR ---
        const { key } = await uploadWithProgress(signedUrl, file, (pct) => {
          setUploadedFiles((prev) =>
            prev.map((u) => (u.id === fileId ? { ...u, progress: pct } : u)),
          );
        });
        // console.log("Upload successful, file key:", key, file.name);
        // --- Step 3: Register ---
        await customFakeFetch("attachments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        // 3. Final Success Update
        setUploadedFiles((prev) =>
          prev.map((u) =>
            u.id === fileId ? { ...u, status: "success", progress: 100 } : u,
          ),
        );
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((u) => (u.id === fileId ? { ...u, status: "error" } : u)),
        );
      }
    }
  }, []);

  const removeFile = (index: number) => {
    fileInputRef.current?.value && (fileInputRef.current.value = ""); // reset file input
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button>{saveLabel}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Sales Assistant"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Call Type <span className="text-destructive">*</span>
                </Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <SelectDropdown
                  lable="Language"
                  root="languages"
                  dropdown={languages}
                  state={language}
                  setState={setLanguage}
                  fetchDropdownHandler={fetchDropdownHandler}
                />
              </div>

              <div className="space-y-2">
                <SelectDropdown
                  lable="Voice"
                  root="voices"
                  dropdown={voices}
                  state={voice}
                  setState={setVoice}
                  fetchDropdownHandler={fetchDropdownHandler}
                />
              </div>

              <div className="space-y-2">
                <SelectDropdown
                  lable="Prompt"
                  root="prompts"
                  dropdown={prompts}
                  state={prompt}
                  setState={setPrompt}
                  fetchDropdownHandler={fetchDropdownHandler}
                />
              </div>

              <div className="space-y-2">
                <SelectDropdown
                  lable="Model"
                  root="models"
                  dropdown={models}
                  state={model}
                  setState={setModel}
                  fetchDropdownHandler={fetchDropdownHandler}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latency ({latency[0].toFixed(1)}s)</Label>
                  <Slider
                    value={latency}
                    onValueChange={setLatency}
                    min={0.3}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed ({speed[0]}%)</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={90}
                    max={130}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What would you like the AI agent to say during the call?"
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 4: Service/Product Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Add a knowledge base about your service or product."
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Reference Data */}
          <CollapsibleSection
            title="Reference Data"
            description="Enhance your agent's knowledge base with uploaded files."
          >
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>
              {/* File list */}
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={f.id}
                      className="p-3 border rounded-lg mb-2 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{f.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatFileSize(f.size)}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold">
                          {f.status === "pending" && (
                            <span className="text-orange-500 animate-pulse">
                              PENDING...
                            </span>
                          )}
                          {f.status === "uploading" && (
                            <span className="text-blue-600">
                              UPLOADING {f.progress}%
                            </span>
                          )}
                          {f.status === "success" && (
                            <span className="text-green-600 font-bold tracking-tight">
                              ✓ SUCCESS
                            </span>
                          )}
                          {f.status === "error" && (
                            <span className="text-red-500">FAILED</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeFile(i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {
                        /* Progress Bar */
                        f.status === "uploading" || f.status === "pending" ? (
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ease-out bg-blue-600`}
                              style={{
                                width:
                                  f.status === "pending"
                                    ? "5%"
                                    : `${f.progress}%`,
                              }}
                            />
                          </div>
                        ) : null
                      }
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">No Files Available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 6: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Tools that allow the AI agent to perform call-handling actions and manage session control."
          >
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to hang up the
                      call
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-hangup" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to make
                      callbacks
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-callback" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Select if you want to transfer the call to a human agent
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-transfer" />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>
        </div>

        {/* Right Column — Sticky Test Call Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Test Call
                </CardTitle>
                <CardDescription>
                  Make a test call to preview your agent. Each test call will
                  deduct credits from your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="test-first-name">First Name</Label>
                      <Input
                        id="test-first-name"
                        placeholder="John"
                        value={testFirstName}
                        onChange={(e) => setTestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-last-name">Last Name</Label>
                      <Input
                        id="test-last-name"
                        placeholder="Doe"
                        value={testLastName}
                        onChange={(e) => setTestLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={testGender} onValueChange={setTestGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <PhoneInput
                      defaultCountry="EG"
                      value={testPhone}
                      onChange={(value) => setTestPhone(value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Start Test Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
