import createNumberMask from "text-mask-addons/dist/createNumberMask";

export const fabStyle = {
	opacity: ".65",
	position: "fixed",
	bottom: "11px",
	right: "104px",
	zIndex: "10000",
	backgroundColor: "rgb(220, 0, 78)",
	borderRadius: "11px",
	padding: "9px",
	width: "fit-content",
	"&:hover": {
		opacity: "1",
	},
};

export const DEFAULT_NUMBER_MASK = createNumberMask({
	prefix: "",
	includeThousandsSeparator: true,
	integerLimit: 10,
	allowDecimal: false,
});

export const DEFAULT_DECIMAL_MASK = createNumberMask({
	prefix: "",
	includeThousandsSeparator: true,
	integerLimit: 10,
	allowDecimal: true,
});

export const ONE_DECIMAL_MASK = createNumberMask({
	prefix: "",
	includeThousandsSeparator: true,
	integerLimit: 10,
	allowDecimal: true,
	decimalLimit: 1,
});

export const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
