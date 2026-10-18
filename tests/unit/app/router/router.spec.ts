import { describe, expect, it } from 'vitest';
import router from '@/app/router';

describe('router', () => {
  it('redirects registrations to the first named option tab', async () => {
    await router.push('/cadastros');

    const { fullPath, matched } = router.currentRoute.value;
    expect(fullPath).toBe('/cadastros/orgaos-de-controle');
    expect(matched[matched.length - 1]?.props).toEqual({ default: { kind: 'control-agency' } });
  });
});
