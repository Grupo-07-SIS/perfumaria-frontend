const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function formatPeractInputValue(type: string, value: string) {
  switch (type) {
    case "telephone": {
      const digits = digitsOnly(value).slice(0, 11);
      if (digits.length <= 2) return digits ? `(${digits}` : "";
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    case "cnpj": {
      const digits = digitsOnly(value).slice(0, 14);
      return digits
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\/\d{4})(\d)/, "$1-$2");
    }
    case "cep": {
      const digits = digitsOnly(value).slice(0, 8);
      return digits.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    case "percent": {
      const digits = digitsOnly(value).slice(0, 5);
      if (!digits) return "";
      const integer = digits.length > 2 ? digits.slice(0, -2) : "0";
      const decimal = digits.slice(-2).padStart(2, "0");
      return `${Number(integer)}.${decimal}%`;
    }
    case "currency": {
      const digits = digitsOnly(value).slice(0, 12);
      if (!digits) return "";
      const integer = digits.length > 2 ? digits.slice(0, -2) : "0";
      const decimal = digits.slice(-2).padStart(2, "0");
      return `${Number(integer)}.${decimal}`;
    }
    case "number": {
      return value.replace(/[^\d.,-]/g, "");
    }
    default:
      return value;
  }
}

export function getNativeInputType(type: string) {
  switch (type) {
    case "email":
      return "email";
    case "password":
      return "password";
    case "number":
      return "text";
    case "telephone":
      return "tel";
    default:
      return "text";
  }
}