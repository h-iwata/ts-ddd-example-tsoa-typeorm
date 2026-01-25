import { OrderStatus, canTransitionTo } from './OrderStatus';

describe('OrderStatus', () => {
  describe('canTransitionTo', () => {
    describe('PENDING からの遷移', () => {
      it('CONFIRMED に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(
          true
        );
      });

      it('CANCELLED に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(
          true
        );
      });

      it('PAID には直接遷移できない', () => {
        expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.PAID)).toBe(
          false
        );
      });

      it('SHIPPED には直接遷移できない', () => {
        expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.SHIPPED)).toBe(
          false
        );
      });

      it('DELIVERED には直接遷移できない', () => {
        expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(
          false
        );
      });
    });

    describe('CONFIRMED からの遷移', () => {
      it('PAID に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.PAID)).toBe(
          true
        );
      });

      it('CANCELLED に遷移できる', () => {
        expect(
          canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)
        ).toBe(true);
      });

      it('SHIPPED には直接遷移できない', () => {
        expect(
          canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.SHIPPED)
        ).toBe(false);
      });
    });

    describe('PAID からの遷移', () => {
      it('SHIPPED に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.PAID, OrderStatus.SHIPPED)).toBe(
          true
        );
      });

      it('CANCELLED に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.PAID, OrderStatus.CANCELLED)).toBe(
          true
        );
      });

      it('DELIVERED には直接遷移できない', () => {
        expect(canTransitionTo(OrderStatus.PAID, OrderStatus.DELIVERED)).toBe(
          false
        );
      });
    });

    describe('SHIPPED からの遷移', () => {
      it('DELIVERED に遷移できる', () => {
        expect(canTransitionTo(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(
          true
        );
      });

      it('CANCELLED には遷移できない', () => {
        expect(
          canTransitionTo(OrderStatus.SHIPPED, OrderStatus.CANCELLED)
        ).toBe(false);
      });
    });

    describe('DELIVERED からの遷移', () => {
      it('どのステータスにも遷移できない', () => {
        expect(
          canTransitionTo(OrderStatus.DELIVERED, OrderStatus.CANCELLED)
        ).toBe(false);
        expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.PENDING)).toBe(
          false
        );
      });
    });

    describe('CANCELLED からの遷移', () => {
      it('どのステータスにも遷移できない', () => {
        expect(
          canTransitionTo(OrderStatus.CANCELLED, OrderStatus.PENDING)
        ).toBe(false);
        expect(
          canTransitionTo(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)
        ).toBe(false);
      });
    });
  });
});
