const cpfDigitsOnlyRegex = /^\d{11}$/;

export const isValidCpf = (cpf: string): boolean => {
  if (!cpfDigitsOnlyRegex.test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  const firstVerifier =
    (digits
      .slice(0, 9)
      .reduce((acc, digit, index) => acc + digit * (10 - index), 0) *
      10) %
    11;
  const firstDigit = firstVerifier === 10 ? 0 : firstVerifier;

  if (firstDigit !== digits[9]) {
    return false;
  }

  const secondVerifier =
    (digits
      .slice(0, 10)
      .reduce((acc, digit, index) => acc + digit * (11 - index), 0) *
      10) %
    11;
  const secondDigit = secondVerifier === 10 ? 0 : secondVerifier;

  return secondDigit === digits[10];
};
