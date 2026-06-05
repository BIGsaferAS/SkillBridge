export interface Role {
  id: string;
  name: string;
  competencies: string[];
}

export interface Department {
  id: string;
  name: string;
  roles: Role[];
}

export interface Sector {
  id: string;
  name: string;
  departments: Department[];
}

export interface TaxonomyData {
  sectors: Sector[];
}
