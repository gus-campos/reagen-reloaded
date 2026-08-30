import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import App from '@/app/App.vue';
import router from '@/app/router';

describe('App', () => {
  it('mounts with its router dependency', async () => {
    await router.push('/auth');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
