export type AdminAccountFormState = {
  username: string;
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export function adminAccountFormFromUser(user: {
  name: string;
  email: string;
}): AdminAccountFormState {
  return {
    username: user.name.trim(),
    email: user.email.trim(),
    current_password: "",
    new_password: "",
    confirm_password: "",
  };
}

export function validateAdminAccountForm(
  form: AdminAccountFormState,
  original: { username: string; email: string },
): string | null {
  const username = form.username.trim();
  const email = form.email.trim();

  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!email) {
    return "Email is required.";
  }

  const usernameChanged = username !== original.username.trim();
  const emailChanged = email !== original.email.trim();
  const passwordChanging =
    form.new_password.length > 0 || form.confirm_password.length > 0;

  if (passwordChanging) {
    if (form.new_password.length < 8) {
      return "New Password must be at least 8 characters.";
    }
    if (form.new_password !== form.confirm_password) {
      return "New Password and confirmation do not match.";
    }
  }

  if (usernameChanged || emailChanged || passwordChanging) {
    if (!form.current_password) {
      return "Enter your current password to save account changes.";
    }
  }

  if (!usernameChanged && !emailChanged && !passwordChanging) {
    return "No account changes to save.";
  }

  return null;
}

export function adminAccountFormToPayload(form: AdminAccountFormState) {
  const payload: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  } = {};

  const username = form.username.trim();
  const email = form.email.trim();

  if (username) {
    payload.username = username;
  }
  if (email) {
    payload.email = email;
  }
  if (form.current_password) {
    payload.current_password = form.current_password;
  }
  if (form.new_password) {
    payload.new_password = form.new_password;
  }

  return payload;
}
