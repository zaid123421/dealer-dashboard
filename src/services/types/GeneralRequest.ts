import { Locale } from "next-intl";

interface GeneralRequest {
    locale?: Locale;
    isFiredFromClient: boolean;
}
export default GeneralRequest;
