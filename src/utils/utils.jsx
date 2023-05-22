import { capitalize, parseInt } from "lodash";

export const calDiscountPercentage = (disAmount, basePrice) => {
  if (disAmount.includes("%")) return parseInt(disAmount);
  else Math.ceil((disAmount / basePrice) * 100);
}

export const calculateProductPriceAfterDiscount = (basePrice, disAmount) => {
  let updatedPrice = 0

  if (disAmount.toString().includes("%")) {
    updatedPrice = Math.ceil(((100 - parseInt(disAmount)) / 100) * basePrice)
  } else {
    if (parseInt(disAmount) > 0) updatedPrice = Math.ceil(basePrice - parseInt(disAmount))
  }

  return updatedPrice
}

export const capitalizeStr = str =>
  str && str
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");

export const shorten_the_name = text => {
  const length = 12;
  return text.slice(0, length) + (text.length > length ? "..." : "");
};

export const shorten_the_name_upto_six = (text) => {
  const length = 6;
  return text.slice(0, length) + (text.length > length ? '...' : '');
};

export const capitalize_and_shorten_name = (text) => {
  const length = 6;
  return capitalizeStr(text.slice(0, length) + (text.length > length ? '...' : ''));
};

export const capitalize_and_unsluygify = str =>
  str && str
    .split("_")
    .map(word => capitalize(word))
    .join(" ");

export const comma_separate_numbers = num => {
  if (!IsNullOrEmpty(num)) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return num
}

export const IsNullOrEmpty = input => {
  if (input === "") return true;
  if (input === null) return true;
  if (input === undefined) return true;
  return false;
}