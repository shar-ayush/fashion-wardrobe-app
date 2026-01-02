export type ClothItem = {
  id?: string;
  image: string;
  type: "shirt" | "pants" | "skirt" | "shoes";
  gender: "female" | "male" | "unisex";
  folder?: string;
};
