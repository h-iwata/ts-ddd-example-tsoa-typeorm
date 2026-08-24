import { canTransitionTo, OrderStatus } from './OrderStatus';

describe('OrderStatus', () => {
  describe('canTransitionTo', () => {
    const { PENDING, CONFIRMED, PAID, SHIPPED, DELIVERED, CANCELLED } = OrderStatus;

    context('when PENDING', () => {
      it('CONFIRMED に遷移できる', () => {
        expect(canTransitionTo(PENDING, CONFIRMED)).toBe(true);
      });

      it('CANCELLED に遷移できる', () => {
        expect(canTransitionTo(PENDING, CANCELLED)).toBe(true);
      });

      it('PAID/SHIPPED/DELIVERED には遷移できない', () => {
        expect(canTransitionTo(PENDING, PAID)).toBe(false);
        expect(canTransitionTo(PENDING, SHIPPED)).toBe(false);
        expect(canTransitionTo(PENDING, DELIVERED)).toBe(false);
      });
    });

    context('when CONFIRMED', () => {
      it('PAID に遷移できる', () => {
        expect(canTransitionTo(CONFIRMED, PAID)).toBe(true);
      });

      it('CANCELLED に遷移できる', () => {
        expect(canTransitionTo(CONFIRMED, CANCELLED)).toBe(true);
      });

      it('SHIPPED には遷移できない', () => {
        expect(canTransitionTo(CONFIRMED, SHIPPED)).toBe(false);
      });
    });

    context('when PAID', () => {
      it('SHIPPED に遷移できる', () => {
        expect(canTransitionTo(PAID, SHIPPED)).toBe(true);
      });

      it('CANCELLED に遷移できる', () => {
        expect(canTransitionTo(PAID, CANCELLED)).toBe(true);
      });

      it('DELIVERED には遷移できない', () => {
        expect(canTransitionTo(PAID, DELIVERED)).toBe(false);
      });
    });

    context('when SHIPPED', () => {
      it('DELIVERED に遷移できる', () => {
        expect(canTransitionTo(SHIPPED, DELIVERED)).toBe(true);
      });

      it('CANCELLED には遷移できない', () => {
        expect(canTransitionTo(SHIPPED, CANCELLED)).toBe(false);
      });
    });

    context('when DELIVERED', () => {
      it('どのステータスにも遷移できない', () => {
        expect(canTransitionTo(DELIVERED, CANCELLED)).toBe(false);
        expect(canTransitionTo(DELIVERED, PENDING)).toBe(false);
      });
    });

    context('when CANCELLED', () => {
      it('どのステータスにも遷移できない', () => {
        expect(canTransitionTo(CANCELLED, PENDING)).toBe(false);
        expect(canTransitionTo(CANCELLED, CONFIRMED)).toBe(false);
      });
    });
  });
});
