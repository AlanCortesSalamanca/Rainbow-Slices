import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.error(`Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function findUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;
  const name = process.env.ADMIN_NAME || 'Administrador';

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    if (existingUser.app_metadata?.role !== 'admin') {
      const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        app_metadata: {
          ...existingUser.app_metadata,
          role: 'admin'
        }
      });

      if (error) {
        throw error;
      }

      console.log('Admin user already exists. app_metadata role was updated safely.');
      return;
    }

    console.log('Admin user already exists. No changes were made.');
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: 'admin'
    },
    app_metadata: {
      role: 'admin'
    }
  });

  if (error) {
    throw error;
  }

  console.log(`Admin user created safely: ${data.user?.email ?? 'admin user'}`);
}

main().catch((error: Error) => {
  console.error(`Could not create admin user: ${error.message}`);
  process.exit(1);
});
