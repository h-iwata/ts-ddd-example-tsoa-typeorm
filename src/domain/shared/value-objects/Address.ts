/**
 * 住所を表す値オブジェクト
 */
export class Address {
  private constructor(
    private readonly postalCode: string,
    private readonly prefecture: string,
    private readonly city: string,
    private readonly street: string,
    private readonly building?: string
  ) {}

  static create(
    postalCode: string,
    prefecture: string,
    city: string,
    street: string,
    building?: string
  ): Address {
    if (!postalCode || !prefecture || !city || !street) {
      throw new Error('Address fields cannot be empty');
    }
    return new Address(postalCode, prefecture, city, street, building);
  }

  getPostalCode(): string {
    return this.postalCode;
  }

  getPrefecture(): string {
    return this.prefecture;
  }

  getCity(): string {
    return this.city;
  }

  getStreet(): string {
    return this.street;
  }

  getBuilding(): string | undefined {
    return this.building;
  }

  getFullAddress(): string {
    const parts = [this.postalCode, this.prefecture, this.city, this.street];
    if (this.building) {
      parts.push(this.building);
    }
    return parts.join(' ');
  }

  equals(other: Address): boolean {
    return (
      this.postalCode === other.postalCode &&
      this.prefecture === other.prefecture &&
      this.city === other.city &&
      this.street === other.street &&
      this.building === other.building
    );
  }
}
