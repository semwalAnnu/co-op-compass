export interface Application {
  id: string;
  content: string;
  company: string;
  url: string;
}

export interface Column {
  id: string;
  title: string;
  applications: Application[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JobData {
  jobTitle: string;
  company: string;
  url: string;
}

export interface Card {
  id: string;
  userId: string;
  company: string;
  role: string;
  url: string;
  status: "TO_APPLY" | "IN_PROGRESS" | "COMPLETED";
  location?: string;
  deadline?: string;
  companyLogo?: string;
}