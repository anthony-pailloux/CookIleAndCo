// URL d'une photo recette
import placeholderPhoto from "../assets/No_Image_Available.jpg";

const apiBaseUrl = import.meta.env.VITE_API_URL;

export function getRecipePhotoUrl(photo) {
  if (photo === null || photo === undefined || photo === "") {
    return placeholderPhoto;
  }

  if (photo.startsWith("/uploads/")) {
    return apiBaseUrl + photo;
  }

  return photo;
}