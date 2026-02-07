// This file is a MOCK implementation to replace Supabase behavior
// as requested by the user to "Don't use supabase".

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mock.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "mock-key";

// We'll create a real client but intercept its methods, 
// OR simpler: just export a plain object that looks like the client.
// Since the user wants to avoid network calls, a plain object is safer.

const createMockChain = () => {
  const chain: any = {
    // These methods return the chain itself to allow .eq().single() etc.
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,

    // Filters also return the chain
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    lt: () => chain,
    gte: () => chain,
    lte: () => chain,
    like: () => chain,
    ilike: () => chain,
    is: () => chain,
    in: () => chain,
    contains: () => chain,
    containedBy: () => chain,
    range: () => chain,
    limit: () => chain,
    offset: () => chain,
    order: () => chain,

    // Modifiers
    single: () => chain,
    maybeSingle: () => chain,
    csv: () => chain,

    // The "then" method makes this object behave like a Promise (Thenable)
    // allowing 'await supabase.from(...).select()' to work.
    then: (onfulfilled?: (value: any) => any) => {
      // Simulate successful response with empty data
      const response = { data: [], error: null };
      return Promise.resolve(response).then(onfulfilled);
    },
  };
  return chain;
};

export const supabase = {
  from: (table: string) => createMockChain(),
  refreshAccessToken: () => Promise.resolve({ data: { session: null }, error: null }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signUp: () => Promise.resolve({ data: {}, error: null }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    getUser: () => {
      const session = localStorage.getItem("mock_user");
      const user = session ? JSON.parse(session) : null;
      return Promise.resolve({ data: { user }, error: null });
    },
    signInAnonymously: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: {}, error: null }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: "mock-path" }, error: null }),
      download: () => Promise.resolve({ data: new Blob(), error: null }),
      list: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: {}, error: null }),
      move: () => Promise.resolve({ data: {}, error: null }),
      remove: () => Promise.resolve({ data: {}, error: null }),
      createSignedUrl: () => Promise.resolve({ data: { signedUrl: "mock-url" }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "mock-url" } }),
    }),
  },
  channel: () => ({
    on: () => ({
      subscribe: () => { },
    }),
    subscribe: () => { },
    unsubscribe: () => { },
  }),
} as unknown as ReturnType<typeof createClient<Database>>;