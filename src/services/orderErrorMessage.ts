export const formatMoneyValue = (value: unknown) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `$${numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const buildOrderFailureMessage = (
  error: any,
  fallbackMessage: string,
) => {
  const baseMessage =
    error?.response?.data?.message || error?.message || fallbackMessage;

  const required = formatMoneyValue(error?.response?.data?.required);
  const available = formatMoneyValue(error?.response?.data?.available);
  const shortfall = formatMoneyValue(error?.response?.data?.shortfall);

  if (!required && !available && !shortfall) {
    return baseMessage;
  }

  const details: string[] = [];
  if (required) details.push(`Required: ${required}`);
  if (available) details.push(`Available: ${available}`);
  if (shortfall) details.push(`Shortfall: ${shortfall}`);

  return `${baseMessage}\n\n${details.join("\n")}`;
};
