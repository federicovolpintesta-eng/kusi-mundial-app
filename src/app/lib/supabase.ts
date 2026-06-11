import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvqvzlqtlvigxvwcqgma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cXZ6bHF0bHZpZ3h2d2NxZ21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTU3MjYsImV4cCI6MjA5NDI5MTcyNn0.dA-6Tg-bbEYzyxqswx33FtOCOktvSrp9TUoI144gEjU';

export const supabase = createClient(supabaseUrl, supabaseKey);
