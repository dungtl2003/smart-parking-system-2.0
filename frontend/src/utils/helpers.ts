import { ActionFunctionArgs, ParamParseKey, Params } from "react-router-dom";

export interface Args extends ActionFunctionArgs {
  params: Params<ParamParseKey<string>>;
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const padZero = (num: number) => String(num).padStart(2, "0");

  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1); // Months are zero-indexed
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
};

const getDateString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getDate = (dateStr: string): Date => {
  //dd/mm/yyyy format
  const [day, month, year] = dateStr.split("/").map(Number);
  const dateObject = new Date(year, month - 1, day);

  return dateObject;
};

const getPages = (rows: number, limit?: number): number => {
  return Math.ceil(rows / (limit || 10)); //default limit is 10
};

export { formatDateTime, getDateString, getPages, getDate };
