import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzrrargmkyqrzufdxeas.supabase.co';
const supabaseKey = 'sb_publishable_uayBD7IbqNkJwi7JGR7wHQ_zBcTmKRe';

export const supabase = createClient(supabaseUrl, supabaseKey);