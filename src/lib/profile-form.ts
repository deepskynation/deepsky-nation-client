export type ProfileFormState = {
  phone_number: string;
  home_address: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
};

export const emptyProfileForm: ProfileFormState = {
  phone_number: "",
  home_address: "",
  city: "",
  region: "",
  country: "",
  postal_code: "",
};

export function profileFormFromUser(user: {
  phone_number?: string | null;
  home_address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
}): ProfileFormState {
  return {
    phone_number: (user.phone_number ?? "").trim(),
    home_address: (user.home_address ?? "").trim(),
    city: (user.city ?? "").trim(),
    region: (user.region ?? "").trim(),
    country: (user.country ?? "").trim(),
    postal_code: (user.postal_code ?? "").trim(),
  };
}

export function validateProfileForm(form: ProfileFormState): string | null {
  if (!form.phone_number.trim()) {
    return "Please enter your phone number.";
  }
  if (!form.home_address.trim()) {
    return "Please enter your home address.";
  }
  if (!form.city.trim()) {
    return "Please enter your city.";
  }
  if (!form.region.trim()) {
    return "Please enter your region or state.";
  }
  if (!form.country.trim()) {
    return "Please enter your country.";
  }
  if (!form.postal_code.trim()) {
    return "Please enter your postal code.";
  }
  return null;
}

export function profileFormToPayload(form: ProfileFormState) {
  return {
    phone_number: form.phone_number.trim(),
    home_address: form.home_address.trim(),
    city: form.city.trim(),
    region: form.region.trim(),
    country: form.country.trim(),
    postal_code: form.postal_code.trim(),
  };
}
