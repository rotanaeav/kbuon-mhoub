export type Category = {
  id: "all" | "rice" | "khmer" | "soup" | "snack" | "dessert";
  name: string;
  nameKhmer: string;
  icon: string;
};

export type MethodStep = {
  title: string;
  description: string;
};

export type Recipe = {
  id: number;
  titleEnglish: string;
  titleKhmer: string;
  categoryId: Category["id"];
  prepTime?: string;
  cookTime: string;
  servings: number;
  description: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  methodSteps?: MethodStep[];
};
