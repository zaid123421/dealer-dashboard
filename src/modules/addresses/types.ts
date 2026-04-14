export interface AddressCountry {
  id: number;
  name: string;
  iso3?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressProvince {
  id: number;
  name: string;
  type?: string;
  countryId: number;
  countryName?: string;
}

export interface AddressCity {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  stateId: number;
  stateName?: string;
  countryId?: number;
  countryName?: string;
}
