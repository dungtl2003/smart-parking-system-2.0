// export interface Error {
//   success: boolean;
//   message?: string;
// }

export interface ActionResult {
  status: boolean;
  message: string;
}

//Link Item
export interface LinkItem {
  name: string;
  visible: boolean;
  src?: string;
  handleClick?: () => void;
}
