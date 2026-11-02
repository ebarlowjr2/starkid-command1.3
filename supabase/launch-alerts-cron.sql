-- First create Vault secrets launch_alert_function_url and launch_alert_cron_secret.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
  if not exists(select 1 from vault.decrypted_secrets where name='launch_alert_function_url')
    or not exists(select 1 from vault.decrypted_secrets where name='launch_alert_cron_secret') then
    raise exception 'Configure launch-alert Vault secrets first';
  end if;
end $$;
select cron.schedule('starkid-launch-alerts','* * * * *',$job$
  select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='launch_alert_function_url'),
    headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='launch_alert_cron_secret')),
    body:='{}'::jsonb, timeout_milliseconds:=65000);
$job$);
-- To disable: select cron.unschedule('starkid-launch-alerts');
