-- ============================================================
-- Carga de dados da produção (Meu Resgate) -> banco novo
-- Preserva IDs, logins e hashes de senha. Gatilhos desligados durante a carga.
-- ============================================================

-- desliga gatilhos de usuário nas tabelas públicas (evita notificações/efeitos falsos)
alter table public.receipts disable trigger user;
alter table public.redemptions disable trigger user;
alter table public.notifications disable trigger user;
alter table public.points_ledger disable trigger user;
alter table public.user_roles disable trigger user;
alter table public.profiles disable trigger user;

-- 1) usuarios de auth (o gatilho handle_new_user cria perfis minimos automaticamente)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) values
('00000000-0000-0000-0000-000000000000', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'authenticated', 'authenticated', 'marianyfranca01@gmail.com', '$2a$10$K2ysal5NN48GDBif7YSw8.pZ42hT0tLQDRc/3ecIaBaIo.x/Bk6HO', '2026-03-20T19:16:46.387716+00:00', NULL, '', '2026-03-20T19:15:47.040443+00:00', '', NULL, '', '', NULL, '2026-03-20T19:18:22.93146+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "13321205556", "phone": "5577998035629", "full_name": "Mariany França", "email_verified": true}'::jsonb, NULL, '2026-03-20T19:15:46.15704+00:00', '2026-03-27T13:22:24.634791+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'authenticated', 'authenticated', 'jeyssonsilva11@gmail.com', '$2a$10$e8kehTCShcg8WvYuWM4TcuGkBS9Ch0hhnyS2.By0fhQJwN394yYa6', '2026-02-16T18:53:53.786388+00:00', NULL, '', '2026-02-16T18:53:40.572247+00:00', '', NULL, '', '', NULL, '2026-02-16T18:53:53.790728+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "10041911547", "phone": "5573998265503", "full_name": "Jeysson Magalhães da Silva", "email_verified": true}'::jsonb, NULL, '2026-02-16T18:53:40.342549+00:00', '2026-03-25T11:47:26.303832+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'authenticated', 'authenticated', 'avancovencer@gmail.com', '$2a$10$uz9HuvsxYxkuzLhdHlczZ.Z7l..zmblb.NVBXeQxRFx9y2HVWJ2QK', '2026-02-16T18:56:07.876651+00:00', NULL, '', '2026-02-16T18:54:14.059987+00:00', '5ba6624235a665fa47eaea3c0063079509aee59b982e84e9506027fd', '2026-02-16T18:55:24.222187+00:00', '', '', NULL, '2026-02-16T18:56:20.28239+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08163564598", "phone": "5577998387282", "full_name": "Darlei Silva França", "email_verified": true}'::jsonb, NULL, '2026-02-16T18:54:13.718055+00:00', '2026-02-17T21:34:18.532859+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'authenticated', 'authenticated', 'sarahsanthus775@gmail.com', '$2a$10$SCpr7ZI2CPWKWFQ0H6tSwOD8ko3/3K/LdSV7wsx..fwLUYeZOVOi.', '2026-03-31T23:42:22.143269+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-31T23:42:22.167521+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "11754077552", "phone": "5577999096884", "full_name": "Sara santos da rocha", "email_verified": true}'::jsonb, NULL, '2026-03-31T23:27:40.506717+00:00', '2026-04-18T00:32:11.235887+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '403f661c-db70-4a5a-9c00-a966909b707c', 'authenticated', 'authenticated', 'joelmadearaujopereira@gmail.com', '$2a$10$nsEeuLOgmX/VFKfFlDLH/encnTiNBikyX7aBUjJoCyM3tZO4NTCl.', NULL, NULL, 'fea91a21cdb7d4e93449dfac5a0d775ccfdaf5b69b6b2d778e95c64f', '2026-03-31T20:28:57.205514+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "10842574590", "phone": "5577998533738", "full_name": "Joelma de Araújo Pereira"}'::jsonb, NULL, '2026-03-31T20:28:56.326188+00:00', '2026-03-31T20:28:57.452928+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', 'authenticated', 'authenticated', 'martafalcao60@gmail.com', '$2a$10$8f6Vct8z3ApY.wz7u6KSMeGfiY.KHY/REpfVRBRZVs/NLA6RpzjRm', NULL, NULL, 'ab019c915321062124226f0487aa2326ff0c1d1d4590ac5df1ef6c86', '2026-07-14T20:22:25.432066+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "45625179808", "phone": "5511974019931", "full_name": "Marta da silva Falcão"}'::jsonb, NULL, '2026-04-01T21:57:14.381926+00:00', '2026-07-14T20:22:25.648888+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'authenticated', 'authenticated', 'hiagoagt1@hotmail.com', '$2a$10$Xs/4HLhTxpgdQelpZ3TTau/9Ed7s7qUrk7Z7j915mdbHTQmlsMzRK', '2026-03-30T12:25:06.277563+00:00', NULL, '', '2026-03-30T12:24:46.714503+00:00', '', NULL, '', '', NULL, '2026-04-08T13:18:32.898545+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "33065979888", "phone": "5535988965480", "full_name": "teste hotmail", "email_verified": true}'::jsonb, NULL, '2026-03-30T12:24:45.690112+00:00', '2026-04-08T13:18:32.962855+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '967c04df-26b2-4b64-9629-696ab31604bc', 'authenticated', 'authenticated', 'igor-henrique3@live.com', '$2a$10$pRaJftrDXdviCG9EfRQtNuO4tevZJNlTS.iDW0/wiSNev7vIeEO8.', '2026-03-05T12:04:44.364296+00:00', NULL, '', '2026-03-05T12:04:21.974205+00:00', '', NULL, '', '', NULL, '2026-03-05T12:11:42.03221+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "11966757409", "phone": "5581992630564", "full_name": "Igor Henrique de Oliveira", "email_verified": true}'::jsonb, NULL, '2026-03-05T12:04:21.095733+00:00', '2026-03-06T17:15:55.546297+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'authenticated', 'authenticated', 'santosluize2509@gmail.com', '$2a$10$92pWhVeLVMZcNcHJINn15uU2Iq/1Q9QJZWCIP3ujffESYme/Dind6', '2026-03-31T22:04:26.587904+00:00', NULL, '', '2026-03-31T22:04:01.385978+00:00', '', NULL, '', '', NULL, '2026-03-31T22:04:26.598081+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "10065175530", "phone": "5577998283834", "full_name": "Victoria Luize santos da paixão", "email_verified": true}'::jsonb, NULL, '2026-03-31T22:04:00.627312+00:00', '2026-03-31T22:04:26.658881+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '63c418aa-5005-4487-bbcf-452a57a98724', 'authenticated', 'authenticated', 'darleisilvafranca31@gmail.com', '$2a$10$PIxpxgyXPI13D/blNb83SONRjAA6fdfE0wxiIh0pt/blXQVNZBYAy', '2026-02-26T13:47:21.741643+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-21T14:07:10.24057+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "07984850518", "phone": "5511919114970", "full_name": "Diogo Silva", "email_verified": true}'::jsonb, NULL, '2026-02-26T13:47:02.826565+00:00', '2026-07-18T13:20:30.08897+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'b1c70b99-362b-4541-83eb-4643682d3eee', 'authenticated', 'authenticated', 'lucasilvacnn@icloud.com', '$2a$10$/gII0uELUPwbGR2UPBbZH.rs//dHPIaLllcPijhxFCmy/lgjBPcIW', NULL, NULL, 'cf264c66010a44deadef69b7778d583948cafb1f418f6999f08f8740', '2026-03-31T21:17:12.256044+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08152523585", "phone": "5577999483915", "full_name": "Lucas Carvalho da Silva"}'::jsonb, NULL, '2026-03-31T21:17:11.469372+00:00', '2026-03-31T21:17:12.491025+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'authenticated', 'authenticated', 'alicecastro0423@gmail.com', '$2a$10$bNDGuFX05Vn7K.pgTyXQyeEOXkxvAWxIgSf7ZZuWs/M5X5NsA4tv6', '2026-02-24T13:26:13.542951+00:00', NULL, '', '2026-02-24T13:22:56.309686+00:00', '', NULL, '', '', NULL, '2026-02-24T13:26:13.572725+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08417464603", "phone": "5535991576429", "full_name": "Alice de Castro Pierangeli", "email_verified": true}'::jsonb, NULL, '2026-02-24T13:22:55.430133+00:00', '2026-02-26T06:20:41.341544+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'authenticated', 'authenticated', 'marianafernandes1564@gmail.com', '$2a$10$RJ76UBcG15anUiqsh5w3/ed2IuMtZVPnoa0XKC6c2enHOigpc3DHK', '2026-03-31T22:37:51.073961+00:00', NULL, '', '2026-03-31T22:37:27.559816+00:00', '', NULL, '', '', NULL, '2026-03-31T22:37:51.083947+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "06632582192", "phone": "5577999466530", "full_name": "Mariana", "email_verified": true}'::jsonb, NULL, '2026-03-31T22:37:26.696525+00:00', '2026-03-31T22:37:51.138704+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'd77585f7-80ac-4466-8f7e-df2f56f14961', 'authenticated', 'authenticated', 'souzadenise81059@gmail.com', '$2a$10$sGSz8e06DssPtiulJpwmY.BzxECaVrsiaLHPXdcZNDKvn.uk8f9hC', NULL, NULL, '284c3912d433fa66a87e8811e2b99786911557957f8cf8b66ddf51a0', '2026-03-31T22:05:26.813988+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "09645579597", "phone": "5577998682116", "full_name": "Denise De Souza Nunes"}'::jsonb, NULL, '2026-03-31T22:05:26.305297+00:00', '2026-03-31T22:05:26.994944+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'authenticated', 'authenticated', 'pamelasantos80247@gmail.com', '$2a$10$BS8E9qp.y1SRryxKM3YVmOv7vaexNKua.h4TB4fLxT3CV3Wg5HiFq', '2026-04-01T00:40:18.387877+00:00', NULL, '', '2026-04-01T00:39:40.515525+00:00', '', NULL, '', '', NULL, '2026-04-01T00:40:18.394301+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "11689096519", "phone": "5577998652532", "full_name": "Pâmela Santos", "email_verified": true}'::jsonb, NULL, '2026-04-01T00:39:39.716869+00:00', '2026-04-01T00:40:18.441614+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'authenticated', 'authenticated', 'suzanabriito@gmail.com', '$2a$10$pBGxkpKbNKWR4H6CVvv0JeClaYtzrfhRKoIoBasufgFGP995iOoba', '2026-02-28T19:27:44.955401+00:00', NULL, '', '2026-02-28T19:27:26.54767+00:00', '', NULL, '', '', NULL, '2026-02-28T19:27:44.963651+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "09984680533", "phone": "5577998598344", "full_name": "Suzana Brito Silva", "email_verified": true}'::jsonb, NULL, '2026-02-28T19:27:25.677784+00:00', '2026-03-01T01:18:34.927189+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'd7018362-2172-4735-8ab5-32acef7b824f', 'authenticated', 'authenticated', 'yoliveiradossantos16@gmail.com', '$2a$10$aY2m3Jti68MfaYbwyISLYeEW7IpLZS/PlHy1kiSGaIV.jnzS3q.Ra', '2026-04-06T18:54:02.771479+00:00', NULL, '', '2026-04-06T18:53:26.135205+00:00', '', NULL, '', '', NULL, '2026-04-06T18:54:02.781086+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "86753553517", "phone": "5577999420737", "full_name": "Yasmim Oliveira dos Santos", "email_verified": true}'::jsonb, NULL, '2026-04-06T18:53:24.961669+00:00', '2026-04-22T08:07:59.730985+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'authenticated', 'authenticated', 'pondonga321@gmail.com', '$2a$10$O8kyI8x422e5tRpSjW2NQeCsngtOCzkQH.KSMuH8Fe3n5h/fe7RN2', NULL, NULL, '88b30fc0a7ac44d7dc3a30f985117fae54922feaae7b0e359e6f6238', '2026-04-02T00:09:35.672692+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "11796366510", "phone": "5573999529212", "full_name": "Marcos Vinícius"}'::jsonb, NULL, '2026-04-02T00:09:34.920683+00:00', '2026-04-02T00:09:35.878782+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'authenticated', 'authenticated', 'juniortrasportecnn@gmail.com', '$2a$10$FPpmuWBURvfhJn689iOC/eORApGpQRwSVGN8nEYa8Gw45/7TWq0Ja', '2026-03-11T23:41:57.029715+00:00', NULL, '', '2026-03-11T23:41:29.857181+00:00', '', NULL, '', '', NULL, '2026-03-11T23:41:57.047827+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "07372803527", "phone": "5577999440201", "full_name": "Sinvaldo Fogaça De Souza Junior", "email_verified": true}'::jsonb, NULL, '2026-03-11T23:41:28.982175+00:00', '2026-03-11T23:41:57.102335+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'authenticated', 'authenticated', 'aline.modesto.am@gmail.com', '$2a$10$RPmpsIjOfzUIpKGdzYqW.OEtr1vw07eo8e57aSKVNCULz/yeu0pOq', '2026-03-20T21:57:51.767198+00:00', NULL, '', '2026-03-20T21:57:18.775143+00:00', '', NULL, '', '', NULL, '2026-03-20T21:57:51.784713+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "00446256501", "phone": "5577999687307", "full_name": "Aline Modesto Ferreira", "email_verified": true}'::jsonb, NULL, '2026-03-20T20:38:11.181463+00:00', '2026-06-22T12:33:57.501334+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'authenticated', 'authenticated', 'mangabeiraalvesgustavo@gmail.com', '$2a$10$J86dwGabcb6sH7fJdmKSf..y8pBN85peCJ4iybrbkc1PlktW6N33G', NULL, NULL, '0c8d8eda72591b1226d154c4c807603f62dccd4a327ff0dd99d18cb6', '2026-05-30T13:55:03.97917+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08220814586", "phone": "5577999880533", "full_name": "Gustavo mangabeira alves"}'::jsonb, NULL, '2026-05-30T13:51:27.214235+00:00', '2026-05-30T13:55:04.170524+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '6477a155-8065-4f58-a910-308365a8e136', 'authenticated', 'authenticated', 'jerrymn00715@gmail.com', '$2a$10$vdQLK4uAWBR0T9XNIlUMn.GB2UdPdyDs.HgZWDk1RuDKBk2SrRJH2', '2026-02-16T19:48:42.774814+00:00', NULL, '', '2026-02-16T19:48:33.180363+00:00', '', NULL, '', '', NULL, '2026-02-16T19:49:00.951621+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "05977514557", "phone": "5577999622853", "full_name": "Jeyel Montalvão Nogueira", "email_verified": true}'::jsonb, NULL, '2026-02-16T19:48:32.95298+00:00', '2026-03-26T19:38:26.221526+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'authenticated', 'authenticated', 'hiagocreaty.fy@gmail.com', '$2a$10$G6GfpdKboEG0QCp98NC5keb5Rx7nwAAGjfo8kvaqDTkeYKJNVRSbK', '2026-03-27T12:16:39.796928+00:00', NULL, '', '2026-03-27T12:15:12.503583+00:00', '', NULL, '', '', NULL, '2026-07-13T14:42:20.303748+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "01831961555", "phone": "5535988924568", "full_name": "hiago", "email_verified": true}'::jsonb, NULL, '2026-03-27T12:15:11.358771+00:00', '2026-07-13T14:42:20.314603+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'af225822-0bb5-4699-8345-48d164b9b28e', 'authenticated', 'authenticated', 'joelalckmin@gmail.com', '$2a$10$xSsTOKY1qrIez2i/7v75YOri5K4MHEZtaUgOjtDsbiJJEPJJ6JfUu', '2026-02-16T19:50:38.316564+00:00', NULL, '', '2026-02-16T19:48:04.186549+00:00', '', NULL, '', '', NULL, '2026-02-16T19:50:38.321764+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "01160705364", "phone": "5577999077214", "full_name": "Joel Filho", "email_verified": true}'::jsonb, NULL, '2026-02-16T19:48:03.650304+00:00', '2026-02-28T15:25:45.550341+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'authenticated', 'authenticated', 'er805039@gmail.com', '$2a$10$6pQQS7KDC60yQUvHmJk0WOhocxsxRr4MxRv/6h4j9BnHTOT0rpq3y', '2026-02-27T14:00:43.55156+00:00', NULL, '', '2026-02-27T14:00:17.134997+00:00', '', NULL, '', '', NULL, '2026-02-27T14:01:33.662561+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "07435645532", "phone": "5571997138874", "full_name": "Elisangela Rodrigues", "email_verified": true}'::jsonb, NULL, '2026-02-27T14:00:16.191585+00:00', '2026-02-27T14:01:33.66798+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'authenticated', 'authenticated', 'eraldocnn5@gmail.com', '$2a$10$jBAIs1FceKyFjvzrIItBxO3ueH7qQ9tGvBUfymRPMigHBJFfmuMB2', '2026-02-25T11:20:37.050383+00:00', NULL, '', '2026-02-25T11:20:03.984192+00:00', '', NULL, '', '', NULL, '2026-02-25T11:20:37.056241+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "01867281589", "phone": "5577998031756", "full_name": "Eraldo Dourado Brandão", "email_verified": true}'::jsonb, NULL, '2026-02-25T11:20:03.182302+00:00', '2026-02-27T23:26:17.147258+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '90a3185a-e962-4928-991d-8220e5bc27ea', 'authenticated', 'authenticated', 'carlinhosbaixista18@gmail.com', '$2a$10$kAMg4xKIyfNd7KOfIDQXjOJtRz0tdgTKxdBtgVB5TO0V1bjznzY6u', '2026-03-30T16:09:53.155247+00:00', NULL, '', '2026-03-30T16:08:33.511355+00:00', '', NULL, '', '', NULL, '2026-03-30T21:39:45.665764+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "00657781541", "phone": "5538997396774", "full_name": "Luiz Carlos Elias Dias", "email_verified": true}'::jsonb, NULL, '2026-03-30T16:08:32.712984+00:00', '2026-03-30T22:09:21.611165+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', 'authenticated', 'authenticated', 'nivaldojesusdasilva@gmail.com', '$2a$10$rwpKXut.O6PqZ9HOmHDtgO43fRgkO6R8sikOp6aB/RRnyW/elE3h6', NULL, NULL, '121d426f21de19bfc99d2cd1ccc26f425d7f905d156d6fa6c2d520f9', '2026-03-31T21:51:29.996725+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "09038912552", "phone": "5577999502006", "full_name": "Nivaldo Jesus Da Silva"}'::jsonb, NULL, '2026-03-31T21:51:29.021263+00:00', '2026-03-31T21:51:30.223968+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'authenticated', 'authenticated', 'thamiriscunha432@gmail.com', '$2a$10$Veq3UmbDsKCF46RFdBoOOu7NNxd1SuGSb0ly6/3otnxjY5nZNiIRW', '2026-03-31T22:17:42.645064+00:00', NULL, '', '2026-03-31T22:17:28.693376+00:00', '', NULL, '', '', NULL, '2026-03-31T22:17:42.658461+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "06579057556", "phone": "5577998581152", "full_name": "Thamiris Cunha de Andrade", "email_verified": true}'::jsonb, NULL, '2026-03-31T22:17:27.982461+00:00', '2026-03-31T22:17:42.70709+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '01d882a1-96f8-42a5-868a-64c7e0a042d9', 'authenticated', 'authenticated', 'th.cerqueir@gmail.com', '$2a$10$75.JJOgi5cKtMzEJbypoVOW5mVywJ3U5YtqjnJtOGqLd/TOmGuTAa', '2026-03-31T20:40:17.650089+00:00', NULL, '', '2026-03-31T20:38:16.532918+00:00', '', NULL, '', '', NULL, '2026-03-31T20:40:17.662694+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08778923506", "phone": "5575998030423", "full_name": "Thais dos Santos Cerqueira", "email_verified": true}'::jsonb, NULL, '2026-03-31T20:38:15.835559+00:00', '2026-04-01T00:51:34.71049+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '223b6fad-06f4-4aac-b203-a6486f05ee0a', 'authenticated', 'authenticated', 'mararoriz5@gmail.com', '$2a$10$DHHk81mWLYSlgM02nptBSeQdzQy4jp1vkbbqZXy2uVWU4zWQx/2i.', '2026-04-01T19:26:10.652078+00:00', NULL, '', '2026-04-01T19:25:36.697325+00:00', '', NULL, '', '', NULL, '2026-04-01T19:26:10.688017+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "03743848511", "phone": "5577998191413", "full_name": "Samara Lopes Roriz", "email_verified": true}'::jsonb, NULL, '2026-04-01T19:25:35.259766+00:00', '2026-04-01T19:26:10.797232+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', 'authenticated', 'authenticated', 'priscila_isabelly@hotmail.com', '$2a$10$MFBSBsAeQ8uyZcNowGwU2eoncV1uAmHWWcbKT.fmijXw3mPuP9M6y', '2026-04-14T12:34:53.041341+00:00', NULL, '', '2026-04-14T12:12:45.964203+00:00', '', NULL, '', '', NULL, '2026-04-14T12:34:53.088218+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "02784093182", "phone": "5577981502528", "full_name": "Suelaine Priscila de Jesus Alves", "email_verified": true}'::jsonb, NULL, '2026-04-14T12:12:45.026176+00:00', '2026-04-14T12:34:53.176271+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', 'authenticated', 'authenticated', 'leonammiguel0@gmail.com', '$2a$10$Jm8XF8.LOegD8M3CheDGdeR90ZyzBOqpvgXjY5itxNIy4nd7m5866', NULL, NULL, '088df754e45c7723a45fb4abac41488de25c0a3d2deec314b4cd8782', '2026-04-21T18:21:47.877658+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "11569814503", "phone": "5577999847171", "full_name": "Leonam miguel"}'::jsonb, NULL, '2026-04-21T18:21:46.650753+00:00', '2026-04-21T18:21:48.107344+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '2422b3dc-6627-4f1a-8c23-42683239a614', 'authenticated', 'authenticated', 'lelett.santos@gmail.com', '$2a$10$Y2gSq5pLY5IUiKPs3xOUz.O286q7aKNIDwYadEitI5w6J57vpz4rW', '2026-05-09T19:36:53.367566+00:00', NULL, '', '2026-05-09T19:34:53.315801+00:00', '', NULL, '', '', NULL, '2026-05-09T19:36:53.390492+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "05750486117", "phone": "5561994372812", "full_name": "LETÍCIA DOS SANTOS REGINO", "email_verified": true}'::jsonb, NULL, '2026-05-09T19:34:52.51948+00:00', '2026-05-09T19:36:53.471599+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '89334953-16df-4963-a464-19a4af258542', 'authenticated', 'authenticated', 'kelysthefanniamoreira@gmail.com', '$2a$10$9E/WumLmOAc1oqFgRLjLKO/8U.jdjKICZLjzgzZiWc5aJ7fgzK5Z2', '2026-04-02T05:44:06.925016+00:00', NULL, '', '2026-04-02T05:43:31.661397+00:00', '', NULL, '', '', NULL, '2026-04-02T05:44:06.932133+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "85365734572", "phone": "5577981367867", "full_name": "Kely sthefannia Moreira", "email_verified": true}'::jsonb, NULL, '2026-04-02T05:43:30.943885+00:00', '2026-04-06T10:39:07.903825+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', 'authenticated', 'authenticated', 'wendryhenrique130@gmail.com', '$2a$10$CHyMaOt9GFo5D0Sm0SOyTuhkbSoI9RSKGauxO3UF/6dvS1Y3P5CIy', '2026-05-06T03:09:20.136848+00:00', NULL, '', '2026-05-06T03:08:37.721674+00:00', '', NULL, '', '', NULL, '2026-05-06T03:09:20.151557+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "02792678275", "phone": "5595991551473", "full_name": "Wendry Henrique", "email_verified": true}'::jsonb, NULL, '2026-05-06T03:08:36.510449+00:00', '2026-05-06T03:09:20.208705+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'authenticated', 'authenticated', 'lpato8766@gmail.com', '$2a$10$gXPAYDlLgzAGGCR8IDtMhe8/q7MEqPxhSxAsBl2F5v.tZi5vl.J62', '2026-04-23T00:59:26.970427+00:00', NULL, '', '2026-04-23T00:59:15.114069+00:00', '', NULL, '', '', NULL, '2026-04-23T00:59:49.92146+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "86243831531", "phone": "5511958373629", "full_name": "Danrlei rosa dos Santos", "email_verified": true}'::jsonb, NULL, '2026-04-23T00:59:13.896671+00:00', '2026-07-09T19:28:15.97501+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'authenticated', 'authenticated', 'eduardacostaa22@icloud.com', '$2a$10$1hIgHFnJVRN7.Lqw0Pgg0eDpu7Ae6IJU4bP/G7f8pnNhHZ4sW0TTa', NULL, NULL, '13eb1a21ab1a8fbf5e2d0eda127615df48fd680fdee10e9f90f7026b', '2026-05-30T13:48:04.797898+00:00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08552317508", "phone": "5577999229559", "full_name": "Maria Eduarda da Silva Costa"}'::jsonb, NULL, '2026-05-30T13:45:15.713316+00:00', '2026-05-30T13:48:05.012321+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'authenticated', 'authenticated', 'igorcnn59@gmail.com', '$2a$10$XpudcV194l3.TzThJ66sh.SVGeWmwkfM1yOzF3tPQ2yDmSs6nBnEC', '2026-07-04T14:44:05.40058+00:00', NULL, '', '2026-07-04T14:43:45.892858+00:00', '', NULL, '', '', NULL, '2026-07-04T14:44:30.184584+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "08246862502", "phone": "5577998593171", "full_name": "Igor Moisés Cardoso e Silva", "email_verified": true}'::jsonb, NULL, '2026-07-04T14:43:44.719081+00:00', '2026-07-04T21:44:20.288777+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'authenticated', 'authenticated', 'pr043201@gmail.com', '$2a$10$.mTnqLsNTeOBi1KY/.gEHOYsdnzj.QrIki/PfbKnOJ2fBohwACI4O', '2026-07-14T20:20:22.786528+00:00', NULL, '', '2026-07-14T20:19:49.851391+00:00', '', NULL, '', '', NULL, '2026-07-14T20:20:22.830529+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "10431562164", "phone": "5577999668607", "full_name": "Vagno Sales  Bahia Filho", "email_verified": true}'::jsonb, NULL, '2026-07-14T20:19:49.027335+00:00', '2026-07-14T22:29:59.398427+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'authenticated', 'authenticated', 'hiago.pereira@aluno.unifenas.br', '$2a$10$hmQCV61mM/fQ1YifrGpGcuLxOvugqM6LBrtD.yBVTep/xgPRoyseO', '2026-02-20T18:05:01.801999+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-07-13T14:44:00.008249+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "38404311668", "phone": "5535988925482", "full_name": "hiago", "email_verified": true}'::jsonb, NULL, '2026-02-20T18:04:05.757583+00:00', '2026-07-13T14:44:00.029981+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '0f97ccd5-ddb0-4af5-a600-1354560220c5', 'authenticated', 'authenticated', 'slopesweb@gmail.com', '$2a$10$48BDMChODCfJ.UxMTDxqcuiLP8Ajts/JGZy5sTce91HC.uxMVG2vC', '2026-07-17T13:29:48.757846+00:00', NULL, '', '2026-07-17T13:29:32.029832+00:00', '', NULL, '', '', NULL, '2026-07-17T13:29:48.768245+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "04851254555", "phone": "5577999448117", "full_name": "Diego", "email_verified": true}'::jsonb, NULL, '2026-07-17T13:29:30.546836+00:00', '2026-07-18T13:44:14.24177+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
('00000000-0000-0000-0000-000000000000', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'authenticated', 'authenticated', 'weltoncnn@gmail.com', '$2a$10$gWn8dcTXaCHPevyiocwXLuJB2KNu5T0hixquEDDns30INJRUobqUe', '2026-02-02T21:11:07.70917+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-07-13T18:07:04.548949+00:00', '{"provider": "email", "providers": ["email"]}'::jsonb, '{"cpf": "02361682583", "sub": "35315e6d-62cc-464c-8299-4f3cd2c32ac9", "email": "weltoncnn@gmail.com", "phone": "5577998945477", "full_name": "Welton dos Santos Nogueira ", "email_verified": true, "phone_verified": false}'::jsonb, NULL, '2026-02-02T21:11:07.680838+00:00', '2026-07-20T02:22:01.287936+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) values
('01ab4b1c-bf88-456b-972e-1ea14cab9950', '01ab4b1c-bf88-456b-972e-1ea14cab9950', '{"sub": "01ab4b1c-bf88-456b-972e-1ea14cab9950", "email": "jeyssonsilva11@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-16T18:53:40.364092+00:00', '2026-02-16T18:53:40.364159+00:00', '2026-02-16T18:53:40.364159+00:00', '2fd78c83-8a79-4b3b-835e-97695f406840'),
('b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', '{"sub": "b27f0a8c-5550-4f8b-9fd0-648c0443208f", "email": "avancovencer@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-16T18:54:13.800531+00:00', '2026-02-16T18:54:13.8006+00:00', '2026-02-16T18:54:13.8006+00:00', 'd173474a-ed89-4873-9a22-461af01a9476'),
('6477a155-8065-4f58-a910-308365a8e136', '6477a155-8065-4f58-a910-308365a8e136', '{"sub": "6477a155-8065-4f58-a910-308365a8e136", "email": "jerrymn00715@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-16T19:48:32.958969+00:00', '2026-02-16T19:48:32.95902+00:00', '2026-02-16T19:48:32.95902+00:00', 'a024c747-a09c-45aa-95a9-2f88cb3f2298'),
('af225822-0bb5-4699-8345-48d164b9b28e', 'af225822-0bb5-4699-8345-48d164b9b28e', '{"sub": "af225822-0bb5-4699-8345-48d164b9b28e", "email": "joelalckmin@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-16T19:48:03.7116+00:00', '2026-02-16T19:48:03.711661+00:00', '2026-02-16T19:48:03.711661+00:00', 'c468f692-60b9-467c-ae05-e55881898298'),
('89106ebb-4cb9-4cd4-981b-359df9fd92d7', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', '{"sub": "89106ebb-4cb9-4cd4-981b-359df9fd92d7", "email": "eraldocnn5@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-25T11:20:03.254014+00:00', '2026-02-25T11:20:03.255303+00:00', '2026-02-25T11:20:03.255303+00:00', 'dd3443c4-d560-47de-9810-9b94c5e0f5b7'),
('dd084b60-f150-49e9-b72b-d00cb9bbc648', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', '{"sub": "dd084b60-f150-49e9-b72b-d00cb9bbc648", "email": "hiagoagt1@hotmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-30T12:24:45.714614+00:00', '2026-03-30T12:24:45.714673+00:00', '2026-03-30T12:24:45.714673+00:00', '219f8db9-6aae-4868-8ba9-34a06af3b0a3'),
('dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', '{"sub": "dffb0a9e-c5fd-4a55-844d-ac2b2010df6a", "email": "hiago.pereira@aluno.unifenas.br", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-20T18:04:05.78747+00:00', '2026-02-20T18:04:05.787527+00:00', '2026-02-20T18:04:05.787527+00:00', '1614d3da-18ee-49f9-b506-75594304558e'),
('9225a213-9c51-4f25-a3e8-1c4c1c76f768', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', '{"sub": "9225a213-9c51-4f25-a3e8-1c4c1c76f768", "email": "alicecastro0423@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-24T13:22:55.490543+00:00', '2026-02-24T13:22:55.490604+00:00', '2026-02-24T13:22:55.490604+00:00', 'b53cde11-1c66-48c5-8769-281655134032'),
('35315e6d-62cc-464c-8299-4f3cd2c32ac9', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '{"cpf": "02361682583", "sub": "35315e6d-62cc-464c-8299-4f3cd2c32ac9", "email": "weltoncnn@gmail.com", "phone": "5577998945477", "full_name": "Welton dos Santos Nogueira ", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-02-02T21:11:07.705725+00:00', '2026-02-02T21:11:07.70578+00:00', '2026-02-02T21:11:07.70578+00:00', '9f117fce-9694-4aa1-9883-fd71ecce71b9'),
('63c418aa-5005-4487-bbcf-452a57a98724', '63c418aa-5005-4487-bbcf-452a57a98724', '{"sub": "63c418aa-5005-4487-bbcf-452a57a98724", "email": "darleisilvafranca31@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-26T13:47:02.90574+00:00', '2026-02-26T13:47:02.905799+00:00', '2026-02-26T13:47:02.905799+00:00', '581bf1a6-a895-4351-b2e0-176f36ea024a'),
('223a152a-660e-46c0-993c-5077e7dc1ee7', '223a152a-660e-46c0-993c-5077e7dc1ee7', '{"sub": "223a152a-660e-46c0-993c-5077e7dc1ee7", "email": "er805039@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-27T14:00:16.263366+00:00', '2026-02-27T14:00:16.26343+00:00', '2026-02-27T14:00:16.26343+00:00', 'e87368b9-4f7c-4fe9-96c7-470541542f21'),
('373bc3a3-07f4-48b3-80c9-caca530e9e09', '373bc3a3-07f4-48b3-80c9-caca530e9e09', '{"sub": "373bc3a3-07f4-48b3-80c9-caca530e9e09", "email": "suzanabriito@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-02-28T19:27:25.752768+00:00', '2026-02-28T19:27:25.752828+00:00', '2026-02-28T19:27:25.752828+00:00', '5e64a0c3-a307-4d59-a123-f599e01aaac8'),
('967c04df-26b2-4b64-9629-696ab31604bc', '967c04df-26b2-4b64-9629-696ab31604bc', '{"sub": "967c04df-26b2-4b64-9629-696ab31604bc", "email": "igor-henrique3@live.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-05T12:04:21.164184+00:00', '2026-03-05T12:04:21.16424+00:00', '2026-03-05T12:04:21.16424+00:00', 'af2bd327-7a7f-48b3-a329-42497d769802'),
('ef6c8d40-a6c2-4057-8d58-515a02d80274', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', '{"sub": "ef6c8d40-a6c2-4057-8d58-515a02d80274", "email": "juniortrasportecnn@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-11T23:41:29.063392+00:00', '2026-03-11T23:41:29.069353+00:00', '2026-03-11T23:41:29.069353+00:00', '27b9d8ce-0693-42bf-bd2a-3a3256d3560a'),
('e7a0789b-f987-4d56-aac7-391e07392b8b', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '{"sub": "e7a0789b-f987-4d56-aac7-391e07392b8b", "email": "marianyfranca01@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-20T19:15:46.228585+00:00', '2026-03-20T19:15:46.229223+00:00', '2026-03-20T19:15:46.229223+00:00', '4a8a3128-ee9b-4558-b555-5d7c924377d9'),
('d3969b1b-39c7-4461-8603-93a4d79ec0db', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', '{"sub": "d3969b1b-39c7-4461-8603-93a4d79ec0db", "email": "aline.modesto.am@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-20T20:38:11.248656+00:00', '2026-03-20T20:38:11.248722+00:00', '2026-03-20T20:38:11.248722+00:00', '57f27fae-4dfa-4644-8c6a-7f17395c9962'),
('cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', '{"sub": "cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f", "email": "hiagocreaty.fy@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-27T12:15:11.432517+00:00', '2026-03-27T12:15:11.432584+00:00', '2026-03-27T12:15:11.432584+00:00', '25cb11b0-2947-4eca-af28-95639db1940d'),
('90a3185a-e962-4928-991d-8220e5bc27ea', '90a3185a-e962-4928-991d-8220e5bc27ea', '{"sub": "90a3185a-e962-4928-991d-8220e5bc27ea", "email": "carlinhosbaixista18@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-30T16:08:32.758694+00:00', '2026-03-30T16:08:32.759219+00:00', '2026-03-30T16:08:32.759219+00:00', '6d07abdc-51bd-4231-ad3d-bae7c1e582b9'),
('403f661c-db70-4a5a-9c00-a966909b707c', '403f661c-db70-4a5a-9c00-a966909b707c', '{"sub": "403f661c-db70-4a5a-9c00-a966909b707c", "email": "joelmadearaujopereira@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-03-31T20:28:56.394717+00:00', '2026-03-31T20:28:56.394775+00:00', '2026-03-31T20:28:56.394775+00:00', 'f15bf61b-ed35-471a-83eb-f3a6420aa3ea'),
('01d882a1-96f8-42a5-868a-64c7e0a042d9', '01d882a1-96f8-42a5-868a-64c7e0a042d9', '{"sub": "01d882a1-96f8-42a5-868a-64c7e0a042d9", "email": "th.cerqueir@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-31T20:38:15.878682+00:00', '2026-03-31T20:38:15.878745+00:00', '2026-03-31T20:38:15.878745+00:00', '5f820adf-da06-47de-9be8-554949764b48'),
('b1c70b99-362b-4541-83eb-4643682d3eee', 'b1c70b99-362b-4541-83eb-4643682d3eee', '{"sub": "b1c70b99-362b-4541-83eb-4643682d3eee", "email": "lucasilvacnn@icloud.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-03-31T21:17:11.52526+00:00', '2026-03-31T21:17:11.525322+00:00', '2026-03-31T21:17:11.525322+00:00', '391d4246-9a6f-47b4-baae-a5af98090ca7'),
('1f33284f-8fff-4467-a35f-afbc8fa64ce5', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', '{"sub": "1f33284f-8fff-4467-a35f-afbc8fa64ce5", "email": "nivaldojesusdasilva@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-03-31T21:51:29.059023+00:00', '2026-03-31T21:51:29.05909+00:00', '2026-03-31T21:51:29.05909+00:00', '68f91d53-d7fe-4b23-8095-4749dec73887'),
('720ad13b-b5b9-41c9-b752-c40c01616ce8', '720ad13b-b5b9-41c9-b752-c40c01616ce8', '{"sub": "720ad13b-b5b9-41c9-b752-c40c01616ce8", "email": "santosluize2509@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-31T22:04:00.660278+00:00', '2026-03-31T22:04:00.660333+00:00', '2026-03-31T22:04:00.660333+00:00', '4bdcf408-8357-4888-ba55-819813b80979'),
('d77585f7-80ac-4466-8f7e-df2f56f14961', 'd77585f7-80ac-4466-8f7e-df2f56f14961', '{"sub": "d77585f7-80ac-4466-8f7e-df2f56f14961", "email": "souzadenise81059@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-03-31T22:05:26.322706+00:00', '2026-03-31T22:05:26.32276+00:00', '2026-03-31T22:05:26.32276+00:00', '5c27d22b-ee0f-4b8c-a797-db4693097ba3'),
('c0e18d89-7f64-4358-8288-2328f33b4ad2', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', '{"sub": "c0e18d89-7f64-4358-8288-2328f33b4ad2", "email": "thamiriscunha432@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-31T22:17:28.025936+00:00', '2026-03-31T22:17:28.025997+00:00', '2026-03-31T22:17:28.025997+00:00', 'c1ebbd43-c8ad-49eb-aa76-f78b05019936'),
('7ece4ee9-29b4-4d61-8d44-662227efcb2c', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', '{"sub": "7ece4ee9-29b4-4d61-8d44-662227efcb2c", "email": "marianafernandes1564@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-03-31T22:37:26.746916+00:00', '2026-03-31T22:37:26.746977+00:00', '2026-03-31T22:37:26.746977+00:00', 'ecc30bc6-4bd6-442d-b358-51fd8f2cab10'),
('de047af9-899b-46db-8ae2-f46f5a19967b', 'de047af9-899b-46db-8ae2-f46f5a19967b', '{"sub": "de047af9-899b-46db-8ae2-f46f5a19967b", "email": "sarahsanthus775@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-03-31T23:27:40.576192+00:00', '2026-03-31T23:27:40.57625+00:00', '2026-03-31T23:27:40.57625+00:00', '3456f9e7-c40e-4007-9b49-e01e3e4874eb'),
('db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', '{"sub": "db067ea9-172d-4c1e-ae9d-a7491d2114dc", "email": "pamelasantos80247@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-01T00:39:39.760903+00:00', '2026-04-01T00:39:39.760958+00:00', '2026-04-01T00:39:39.760958+00:00', '70e7c8a7-d6ac-4773-8b43-59effeda625a'),
('223b6fad-06f4-4aac-b203-a6486f05ee0a', '223b6fad-06f4-4aac-b203-a6486f05ee0a', '{"sub": "223b6fad-06f4-4aac-b203-a6486f05ee0a", "email": "mararoriz5@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-01T19:25:35.313956+00:00', '2026-04-01T19:25:35.314013+00:00', '2026-04-01T19:25:35.314013+00:00', 'cc0d4e43-0ddc-43c4-8fea-e9c3e06711f7'),
('2a7b8bf3-dc56-4e67-aea2-9cec00af9515', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', '{"sub": "2a7b8bf3-dc56-4e67-aea2-9cec00af9515", "email": "martafalcao60@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-04-01T21:57:14.444592+00:00', '2026-04-01T21:57:14.444649+00:00', '2026-04-01T21:57:14.444649+00:00', '0121b405-777c-4647-897a-1dcee36d03b2'),
('860e73de-d17c-4fc4-985e-e2cf3cd0b304', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', '{"sub": "860e73de-d17c-4fc4-985e-e2cf3cd0b304", "email": "pondonga321@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-04-02T00:09:34.974855+00:00', '2026-04-02T00:09:34.974912+00:00', '2026-04-02T00:09:34.974912+00:00', 'a0775f71-a40f-4839-ae98-88700e0d7692'),
('89334953-16df-4963-a464-19a4af258542', '89334953-16df-4963-a464-19a4af258542', '{"sub": "89334953-16df-4963-a464-19a4af258542", "email": "kelysthefanniamoreira@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-02T05:43:30.985584+00:00', '2026-04-02T05:43:30.98565+00:00', '2026-04-02T05:43:30.98565+00:00', 'ef9fbd3c-0a21-4736-86a0-1bd3f39f70c3'),
('d7018362-2172-4735-8ab5-32acef7b824f', 'd7018362-2172-4735-8ab5-32acef7b824f', '{"sub": "d7018362-2172-4735-8ab5-32acef7b824f", "email": "yoliveiradossantos16@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-06T18:53:25.041106+00:00', '2026-04-06T18:53:25.041176+00:00', '2026-04-06T18:53:25.041176+00:00', '8024cc4d-b062-4fb4-953e-b7501b7db0b5'),
('cecc3e69-f1eb-446e-942c-9aac616c0bab', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', '{"sub": "cecc3e69-f1eb-446e-942c-9aac616c0bab", "email": "priscila_isabelly@hotmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-14T12:12:45.104928+00:00', '2026-04-14T12:12:45.104987+00:00', '2026-04-14T12:12:45.104987+00:00', '279ae55a-95cf-4891-b53b-d891e9ae4016'),
('8e5e7efc-9819-496c-9e71-e733d0d4a08f', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', '{"sub": "8e5e7efc-9819-496c-9e71-e733d0d4a08f", "email": "leonammiguel0@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-04-21T18:21:46.726167+00:00', '2026-04-21T18:21:46.726223+00:00', '2026-04-21T18:21:46.726223+00:00', 'ad2f5354-890d-423a-b998-cfdfd3a4b0a7'),
('72159686-5b43-4f0f-9470-dc493c8bc9b7', '72159686-5b43-4f0f-9470-dc493c8bc9b7', '{"sub": "72159686-5b43-4f0f-9470-dc493c8bc9b7", "email": "lpato8766@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-04-23T00:59:13.973144+00:00', '2026-04-23T00:59:13.97321+00:00', '2026-04-23T00:59:13.97321+00:00', '54a8c772-cb9c-478d-91e9-d4e01d22f94d'),
('3ab60b74-a1a2-4d88-8b45-9fe6acd32389', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', '{"sub": "3ab60b74-a1a2-4d88-8b45-9fe6acd32389", "email": "wendryhenrique130@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-05-06T03:08:36.592212+00:00', '2026-05-06T03:08:36.592271+00:00', '2026-05-06T03:08:36.592271+00:00', 'ef9d44c2-8926-4829-a30f-600387532ae7'),
('2422b3dc-6627-4f1a-8c23-42683239a614', '2422b3dc-6627-4f1a-8c23-42683239a614', '{"sub": "2422b3dc-6627-4f1a-8c23-42683239a614", "email": "lelett.santos@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-05-09T19:34:52.592265+00:00', '2026-05-09T19:34:52.592323+00:00', '2026-05-09T19:34:52.592323+00:00', '9d037131-b260-40d3-9fd1-75bc9db78420'),
('2f049ab3-52bd-4501-8953-92d9c412fe2a', '2f049ab3-52bd-4501-8953-92d9c412fe2a', '{"sub": "2f049ab3-52bd-4501-8953-92d9c412fe2a", "email": "eduardacostaa22@icloud.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-05-30T13:45:15.819486+00:00', '2026-05-30T13:45:15.819541+00:00', '2026-05-30T13:45:15.819541+00:00', '8c8e0fe6-6631-420b-a592-2cf156ba3c07'),
('e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', '{"sub": "e757d643-c64b-4be1-b6b2-eaca7d9ab33a", "email": "mangabeiraalvesgustavo@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb, 'email', '2026-05-30T13:51:27.295847+00:00', '2026-05-30T13:51:27.295913+00:00', '2026-05-30T13:51:27.295913+00:00', 'f84510d3-e223-4fb2-85f2-7809e03f2d25'),
('81327958-0ca5-47ba-a274-0fd3acfca3e6', '81327958-0ca5-47ba-a274-0fd3acfca3e6', '{"sub": "81327958-0ca5-47ba-a274-0fd3acfca3e6", "email": "igorcnn59@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-07-04T14:43:44.807765+00:00', '2026-07-04T14:43:44.807826+00:00', '2026-07-04T14:43:44.807826+00:00', 'e934a0d2-554a-49ed-ab16-e740c734d4d8'),
('5338ad66-e1ec-481d-ae32-7b68f6061469', '5338ad66-e1ec-481d-ae32-7b68f6061469', '{"sub": "5338ad66-e1ec-481d-ae32-7b68f6061469", "email": "pr043201@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-07-14T20:19:49.09336+00:00', '2026-07-14T20:19:49.094135+00:00', '2026-07-14T20:19:49.094135+00:00', '39849bd8-437c-469f-8cac-0efdbea0bf35'),
('0f97ccd5-ddb0-4af5-a600-1354560220c5', '0f97ccd5-ddb0-4af5-a600-1354560220c5', '{"sub": "0f97ccd5-ddb0-4af5-a600-1354560220c5", "email": "slopesweb@gmail.com", "email_verified": true, "phone_verified": false}'::jsonb, 'email', '2026-07-17T13:29:30.610825+00:00', '2026-07-17T13:29:30.610885+00:00', '2026-07-17T13:29:30.610885+00:00', '99e114c5-41cd-4bfe-b4d4-556530478e7a');

-- remove os perfis/roles minimos criados pelo gatilho, para inserir os reais
delete from public.user_roles;
delete from public.profiles;

-- 2) dados publicos (ordem de dependencia)
insert into public.establishments (id, name, description, address, qr_code_token, logo_url, active, created_at, updated_at) values
('2b6fdac4-dde1-4322-8fda-343bc7d98bff', 'Atacadão do Del', NULL, 'R. Antônio Abreu - Carinhanha, BA, 46445-000 - Alto da Colina', '284c712f-0574-4b57-9903-62c62a86e893', 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/establishments/establishments/1c5e77c5-1d5e-4cd4-a21f-3d19af0b4a4b.png', true, '2026-02-03T12:34:51.006513+00:00', '2026-02-03T12:34:51.006513+00:00'),
('75771fbf-9234-43c7-82fc-fcc1a1c16a10', 'Refrigera Mais', NULL, 'Rua Dom Bosco, Bairro São Francisco', '4d3ba683-a0b7-4032-97dc-0b2fa73af49c', NULL, true, '2026-02-03T12:39:06.653886+00:00', '2026-02-03T12:52:07.092657+00:00'),
('eff75400-cea5-4cdc-a9e3-ebbae2325f5b', 'Energy Solar', NULL, NULL, 'ad81e469-7982-4ba2-ba38-d99c056a6acf', 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/establishments/establishments/13ecc293-ec12-4a27-ac1f-3c70e6b3594f.jpg', true, '2026-02-27T18:56:10.765435+00:00', '2026-02-27T19:03:26.038934+00:00'),
('ce21bc5a-abe7-460a-9c1a-61a9a567658c', 'Loja teste', NULL, NULL, 'c2c732d0-3780-4288-a3d4-965a69043348', NULL, true, '2026-03-21T14:04:31.013791+00:00', '2026-03-21T14:04:31.013791+00:00'),
('7c695362-2c22-4fe9-9fb5-b75d6aa1d19a', 'Ótica Santa Luzia', NULL, NULL, '5a5c47b2-7049-48ec-8612-302b4ce7b37b', NULL, true, '2026-03-27T11:42:10.850287+00:00', '2026-03-27T11:42:10.850287+00:00');

insert into public.products (id, name, description, image_url, points_cost, stock, active, created_at, updated_at, prize_value_reais, points_calculated, points_manual_edit) values
('bdcdf3cc-596f-4737-a7f7-90447f77cf0a', 'Smartphone Samsung Galaxy A17 5G 128GB 6,7”', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/4c806aa4-cf30-497e-bfbb-1013c3a4b2e4.webp', 600000, 1000, true, '2026-02-03T15:18:10.626597+00:00', '2026-02-03T21:26:35.070082+00:00', 1500, 600000, false),
('2fd6be12-a5a9-4d11-b45b-5d0a91dcf25d', 'Panela de Pressão Elétrica Electrolux Efficient PCE15', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/05f6648a-6ff0-4819-886e-1b9154a0cd34.webp', 320000, 1000, true, '2026-02-03T15:17:13.361965+00:00', '2026-02-03T21:26:48.446362+00:00', 800, 320000, false),
('ae6efeb7-0005-46e7-aec6-07028319c9ae', 'Voucher Corrida de Carro', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/3e78f089-5891-4b97-9068-f883e36789b7.png', 40000, 2000, true, '2026-02-03T15:15:58.566141+00:00', '2026-02-03T21:27:03.72447+00:00', 100, 40000, false),
('ec2ae44d-3957-4dee-8dbc-99a8f4f2b749', 'Voucher Moto Táxi', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/ab9213d7-a395-4908-a8db-f4256fa7aaf0.jpeg', 20000, 2000, true, '2026-02-03T15:13:36.819956+00:00', '2026-02-03T21:27:37.818397+00:00', 50, 20000, false),
('4a007503-dca1-4a5e-acd4-37b7b7e6543a', 'Cesta Básica', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/97fd2989-1b1b-48b4-9ea4-5fbff9faca68.jpeg', 140000, 1000, true, '2026-02-03T15:09:48.249981+00:00', '2026-02-03T21:28:07.671168+00:00', 350, 140000, false),
('954c3d01-780e-484f-b785-09e3d8c53ab9', 'Açaí Tradicional Copo 500ML', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/12963cc0-dd52-48f8-aea4-99ab43ba6755.jpeg', 20000, 1000, true, '2026-02-03T15:08:32.843546+00:00', '2026-02-03T21:28:20.566974+00:00', 50, 20000, false),
('626063b1-a504-4040-9792-eac629616924', 'Voucher Almoco', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/43810098-87a1-4fde-9330-71e54f9b4f20.jpeg', 20000, 1000, true, '2026-02-03T15:04:38.483907+00:00', '2026-02-03T21:28:40.540091+00:00', 50, 20000, false),
('c10eba08-838c-4c82-ad6e-3afbfde94354', 'Voucher Pães 10 Unidades', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/5751bdda-9ebe-4e88-9392-2a05c8a3add0.jpeg', 20000, 999, true, '2026-02-03T15:11:49.249621+00:00', '2026-07-04T14:56:28.400801+00:00', 50, 20000, false),
('23720761-bb59-4ad9-aeb9-0f641524fdb2', 'UniTV V10 4K Full HD tv box', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/b50118ac-fd96-4812-aa6a-6bdcce1ff403.png', 240000, 1000, true, '2026-02-04T02:11:31.105673+00:00', '2026-02-04T02:11:31.105673+00:00', 600, 240000, false),
('473d357f-9e15-482a-8452-ea68853d7a31', 'Bicicleta Aro 29', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/29490527-1691-4438-b3af-cbfee0102a08.webp', 600000, 1000, true, '2026-02-04T02:13:54.482277+00:00', '2026-02-04T02:13:54.482277+00:00', 1500, 600000, false),
('f901950b-8451-4031-a89d-d5605faaf66f', 'Voucher em Dinheiro', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/185d3152-3e56-4a5f-82a8-f4558e46bf02.jpeg', 4000, 999, true, '2026-02-05T17:02:19.856965+00:00', '2026-02-16T20:07:47.274595+00:00', 10, 4000, false),
('f4201620-985f-454a-8b26-41b3bc1fc45a', 'Voucher em Dinheiro', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/0bc0296c-55f4-42c3-a0f2-94e1f89934ce.png', 20000, 999, true, '2026-02-05T14:57:55.995624+00:00', '2026-02-16T20:08:22.923874+00:00', 50, 20000, false),
('c8064d44-868b-4676-8e84-129cc9c099e7', ' Gás Glp Com 13 Kg', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/b3952ffd-0093-42c9-869b-14fcd1962c42.png', 52000, 999, true, '2026-02-03T15:21:23.629599+00:00', '2026-02-16T20:09:00.847895+00:00', 130, 52000, false),
('6d7cc5a5-d4e7-4abb-98c8-e0b2164eb7b3', 'Ventilador Mesa Super Turbo 8 Pás Mondial Vtx-40-crystal', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/629f5bcf-3e30-4eb2-9fd9-242631b3fc9a.webp', 80000, 998, true, '2026-02-03T15:19:21.836803+00:00', '2026-02-27T18:43:04.100557+00:00', 200, 80000, false),
('f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 'Voucher em Dinheiro', NULL, 'https://rymywtllzgysesdzstof.supabase.co/storage/v1/object/public/products/products/fc5107ba-7efa-4b09-943b-d831970f16dd.jpeg', 8000, 994, true, '2026-02-05T17:03:02.959807+00:00', '2026-07-14T20:55:03.050227+00:00', 20, 8000, false);

insert into public.profiles (id, user_id, full_name, phone, avatar_url, created_at, updated_at, cpf) values
('71652ecf-9927-4ac9-b5bc-8a67201adbd9', '63c418aa-5005-4487-bbcf-452a57a98724', 'Diogo Silva', '5511919114970', NULL, '2026-02-26T13:47:02.825598+00:00', '2026-02-26T13:47:02.825598+00:00', '07984850518'),
('5c4e1f82-7f76-42f6-ad6b-163d91d46814', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Elisangela Rodrigues', '5571997138874', NULL, '2026-02-27T14:00:16.190538+00:00', '2026-02-27T14:00:16.190538+00:00', '07435645532'),
('05b08309-0a53-4c08-9c6b-55fffd709aae', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Suzana Brito Silva', '5577998598344', NULL, '2026-02-28T19:27:25.676216+00:00', '2026-02-28T19:27:25.676216+00:00', '09984680533'),
('304cfbd1-21e2-4394-9eb0-a1d07653d874', '967c04df-26b2-4b64-9629-696ab31604bc', 'Igor Henrique de Oliveira', '5581992630564', NULL, '2026-03-05T12:04:21.094194+00:00', '2026-03-05T12:04:21.094194+00:00', '11966757409'),
('2fb3bfd3-3785-427c-8325-a8444143b66d', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Sinvaldo Fogaça De Souza Junior', '5577999440201', NULL, '2026-03-11T23:41:28.980619+00:00', '2026-03-11T23:41:28.980619+00:00', '07372803527'),
('d1800e53-b055-4483-b06f-2d9ef90a1994', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Mariany França', '5577998035629', NULL, '2026-03-20T19:15:46.153443+00:00', '2026-03-20T19:15:46.153443+00:00', '13321205556'),
('6df1465b-0017-4eb8-b7df-8f9fdb472dba', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'Aline Modesto Ferreira', '5577999687307', NULL, '2026-03-20T20:38:11.181111+00:00', '2026-03-20T20:38:11.181111+00:00', '00446256501'),
('79cc4209-5e26-4242-946a-05585964d89e', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'hiago', '5535988924568', NULL, '2026-03-27T12:15:11.356253+00:00', '2026-03-27T12:15:11.356253+00:00', '01831961555'),
('e95d3f4e-25c3-4637-b5e1-8e273b67587d', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'teste hotmail', '5535988965480', NULL, '2026-03-30T12:24:45.6898+00:00', '2026-03-30T12:24:45.6898+00:00', '33065979888'),
('9f9e9ca6-6363-4789-aaee-481b46c493da', '90a3185a-e962-4928-991d-8220e5bc27ea', 'Luiz Carlos Elias Dias', '5538997396774', NULL, '2026-03-30T16:08:32.710065+00:00', '2026-03-30T16:08:32.710065+00:00', '00657781541'),
('0b6f1b13-2246-4372-bd5e-baec84a4003f', '403f661c-db70-4a5a-9c00-a966909b707c', 'Joelma de Araújo Pereira', '5577998533738', NULL, '2026-03-31T20:28:56.323915+00:00', '2026-03-31T20:28:56.323915+00:00', '10842574590'),
('2c6ab3e5-e76c-4be5-b59d-59810cec0ada', '01d882a1-96f8-42a5-868a-64c7e0a042d9', 'Thais dos Santos Cerqueira', '5575998030423', NULL, '2026-03-31T20:38:15.833946+00:00', '2026-03-31T20:38:15.833946+00:00', '08778923506'),
('a7fc9680-0c2b-4e14-a0e7-3a84468a0c93', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Jeysson Magalhães da Silva', '5573998265503', NULL, '2026-02-16T18:53:40.342216+00:00', '2026-02-16T18:53:40.342216+00:00', '10041911547'),
('acdf0c75-3b2e-4e4a-b719-c160ce3c57f1', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Darlei Silva França', '5577998387282', NULL, '2026-02-16T18:54:13.71402+00:00', '2026-02-16T18:54:13.71402+00:00', '08163564598'),
('ae860368-1336-4251-9075-aa98476d5e21', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Joel Filho', '5577999077214', NULL, '2026-02-16T19:48:03.648538+00:00', '2026-02-16T19:48:03.648538+00:00', '01160705364'),
('b374b953-2058-4ffc-9d1a-88c6dceefbbd', '6477a155-8065-4f58-a910-308365a8e136', 'Jeyel Montalvão Nogueira', '5577999622853', NULL, '2026-02-16T19:48:32.951828+00:00', '2026-02-16T19:48:32.951828+00:00', '05977514557'),
('83d8a8d9-b629-4837-a2ca-a39dfcc21027', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Welton dos Santos Nogueira ', '5577998945477', NULL, '2026-02-02T21:11:07.679709+00:00', '2026-02-02T21:11:08.278976+00:00', '02361682583'),
('1d64dd91-6ddf-4825-bd6a-975ba425f373', 'b1c70b99-362b-4541-83eb-4643682d3eee', 'Lucas Carvalho da Silva', '5577999483915', NULL, '2026-03-31T21:17:11.468239+00:00', '2026-03-31T21:17:11.468239+00:00', '08152523585'),
('617e2460-09b8-43f4-b5ca-572209d280dc', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', 'Nivaldo Jesus Da Silva', '5577999502006', NULL, '2026-03-31T21:51:29.019095+00:00', '2026-03-31T21:51:29.019095+00:00', '09038912552'),
('0835921f-e1c8-4277-bfc5-b04fabdc3c6a', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'hiago', '5535988925480', NULL, '2026-02-20T17:49:26.704576+00:00', '2026-02-20T17:49:26.704576+00:00', '15781963618'),
('2bb24618-e141-455d-8b4f-e3bb8aa6da55', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'hiago', '5535988925481', NULL, '2026-02-20T17:53:29.657112+00:00', '2026-02-20T17:53:29.657112+00:00', '14842609613'),
('c60270c2-ce3c-4cb0-8ef4-89a50e9c66fe', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'hiago', '5535988925482', NULL, '2026-02-20T18:04:05.757241+00:00', '2026-02-20T18:04:05.757241+00:00', '38404311668'),
('bec4e0f5-06ae-47c2-a56a-fcd0a05b0225', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Alice de Castro Pierangeli', '5535991576429', NULL, '2026-02-24T13:22:55.429165+00:00', '2026-02-24T13:22:55.429165+00:00', '08417464603'),
('86ea49bb-6c00-4b4e-b58e-d9f0b7349c9c', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Eraldo Dourado Brandão', '5577998031756', NULL, '2026-02-25T11:20:03.181207+00:00', '2026-02-25T11:20:03.181207+00:00', '01867281589'),
('cbfdd3f0-8ab9-4d67-8068-03bf1ad24a0b', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'Victoria Luize santos da paixão', '5577998283834', NULL, '2026-03-31T22:04:00.626312+00:00', '2026-03-31T22:04:00.626312+00:00', '10065175530'),
('e6e9e287-9f39-4709-b2c9-70cb3fad1e18', 'd77585f7-80ac-4466-8f7e-df2f56f14961', 'Denise De Souza Nunes', '5577998682116', NULL, '2026-03-31T22:05:26.30426+00:00', '2026-03-31T22:05:26.30426+00:00', '09645579597'),
('197b1021-f597-4827-8ccb-837d6ebc20f4', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'Thamiris Cunha de Andrade', '5577998581152', NULL, '2026-03-31T22:17:27.98138+00:00', '2026-03-31T22:17:27.98138+00:00', '06579057556'),
('276ff433-da19-482d-9fcd-0fc3e90bebcb', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'Mariana', '5577999466530', NULL, '2026-03-31T22:37:26.696145+00:00', '2026-03-31T22:37:26.696145+00:00', '06632582192'),
('74e46664-d01e-4bd0-b2f0-4dc3504b9f56', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'Sara santos da rocha', '5577999096884', NULL, '2026-03-31T23:27:40.504544+00:00', '2026-03-31T23:27:40.504544+00:00', '11754077552'),
('f14d6c49-8e96-4c29-89b4-6c50d2658f7b', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'Pâmela Santos', '5577998652532', NULL, '2026-04-01T00:39:39.716508+00:00', '2026-04-01T00:39:39.716508+00:00', '11689096519'),
('a086c0e3-fb7f-4588-8790-226421fe29fd', '223b6fad-06f4-4aac-b203-a6486f05ee0a', 'Samara Lopes Roriz', '5577998191413', NULL, '2026-04-01T19:25:35.259361+00:00', '2026-04-01T19:25:35.259361+00:00', '03743848511'),
('9ae02357-af95-41a5-81d0-87f807bc4b31', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', 'Marta da silva Falcão', '5511974019931', NULL, '2026-04-01T21:57:14.38156+00:00', '2026-04-01T21:57:14.38156+00:00', '45625179808'),
('6094503a-be4d-45e2-a88c-87cfa93e1fc1', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'Marcos Vinícius', '5573999529212', NULL, '2026-04-02T00:09:34.919695+00:00', '2026-04-02T00:09:34.919695+00:00', '11796366510'),
('bee34c57-c880-441c-85b4-348550f1521d', '89334953-16df-4963-a464-19a4af258542', 'Kely sthefannia Moreira', '5577981367867', NULL, '2026-04-02T05:43:30.943491+00:00', '2026-04-02T05:43:30.943491+00:00', '85365734572'),
('df6e81ad-9be3-498e-94f4-2375ff5959cf', 'd7018362-2172-4735-8ab5-32acef7b824f', 'Yasmim Oliveira dos Santos', '5577999420737', NULL, '2026-04-06T18:53:24.961292+00:00', '2026-04-06T18:53:24.961292+00:00', '86753553517'),
('bf56a70c-dc35-4b9e-b4db-c94a1edb4c83', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', 'Suelaine Priscila de Jesus Alves', '5577981502528', NULL, '2026-04-14T12:12:45.025766+00:00', '2026-04-14T12:12:45.025766+00:00', '02784093182'),
('c463d221-c273-4b73-b6eb-90e24f2a48d5', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', 'Leonam miguel', '5577999847171', NULL, '2026-04-21T18:21:46.650352+00:00', '2026-04-21T18:21:46.650352+00:00', '11569814503'),
('ca62465b-1bf2-4a8f-a7d4-74fb7ea15773', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'Danrlei rosa dos Santos', '5511958373629', NULL, '2026-04-23T00:59:13.896293+00:00', '2026-04-23T00:59:13.896293+00:00', '86243831531'),
('12c34bae-c2a1-4e15-a7fa-3cdfb1b3c224', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', 'Wendry Henrique', '5595991551473', NULL, '2026-05-06T03:08:36.510065+00:00', '2026-05-06T03:08:36.510065+00:00', '02792678275'),
('5af7de5d-7bdb-4c72-a40d-ef74fbc3f749', '2422b3dc-6627-4f1a-8c23-42683239a614', 'LETÍCIA DOS SANTOS REGINO', '5561994372812', NULL, '2026-05-09T19:34:52.519105+00:00', '2026-05-09T19:34:52.519105+00:00', '05750486117'),
('179b6240-341b-4866-834e-2fca5431e2fa', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'Maria Eduarda da Silva Costa', '5577999229559', NULL, '2026-05-30T13:45:15.712402+00:00', '2026-05-30T13:45:15.712402+00:00', '08552317508'),
('8b97c3ac-78ed-47fc-b808-0a84d6f0ab0a', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'Gustavo mangabeira alves', '5577999880533', NULL, '2026-05-30T13:51:27.213187+00:00', '2026-05-30T13:51:27.213187+00:00', '08220814586'),
('b7450907-23d3-44d4-961f-fed8194bfecb', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'Igor Moisés Cardoso e Silva', '5577998593171', NULL, '2026-07-04T14:43:44.718041+00:00', '2026-07-04T14:43:44.718041+00:00', '08246862502'),
('1acb2371-bc30-455d-b3b7-928f58510d05', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'Vagno Sales  Bahia Filho', '5577999668607', NULL, '2026-07-14T20:19:49.026148+00:00', '2026-07-14T22:31:05.059492+00:00', '10431562164'),
('af72c651-fe7c-479a-b296-132b5633605f', '0f97ccd5-ddb0-4af5-a600-1354560220c5', 'Diego', '5577999448117', NULL, '2026-07-17T13:29:30.546455+00:00', '2026-07-17T13:29:30.546455+00:00', '04851254555');

insert into public.user_roles (id, user_id, role, created_at) values
('cb2adb61-cc11-4d2c-8125-b9df5fa0b27e', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'user', '2026-02-16T18:54:13.71402+00:00'),
('c467e207-547c-44a7-84ce-c951831661f8', 'af225822-0bb5-4699-8345-48d164b9b28e', 'user', '2026-02-16T19:48:03.648538+00:00'),
('7530ee1f-c3a1-4242-ba43-d9f43fc0fb97', '6477a155-8065-4f58-a910-308365a8e136', 'user', '2026-02-16T19:48:32.951828+00:00'),
('d532afbe-fbc0-4858-ad1b-b9fbd1b126f7', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'user', '2026-02-20T17:49:26.704576+00:00'),
('4c37c1f8-d8a1-4816-8acd-cc0c25769ce7', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'user', '2026-02-20T17:53:29.657112+00:00'),
('11dc3ba7-c0ab-4a18-8310-23effb4d3b90', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'admin', '2026-02-20T18:04:05.757241+00:00'),
('f188f8a9-dc1c-4618-b424-b4e28a33d457', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'user', '2026-02-16T18:53:40.342216+00:00'),
('ffd99c6b-4734-41f2-aa7e-d811e97f7baa', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'user', '2026-02-24T13:22:55.429165+00:00'),
('3a4c798e-efe4-4dbc-aab4-bec6a9d67274', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'user', '2026-02-25T11:20:03.181207+00:00'),
('ddfdb1dd-fddc-4a72-9e6e-872212fd8bf5', '63c418aa-5005-4487-bbcf-452a57a98724', 'user', '2026-02-26T13:47:02.825598+00:00'),
('edad4021-7602-416a-8299-9d6d9ee0d5db', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'user', '2026-02-27T14:00:16.190538+00:00'),
('c0e2e559-af19-4301-a3c3-4c6672f32463', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'user', '2026-02-28T19:27:25.676216+00:00'),
('d620c2ec-2944-412b-866e-2e0ff3ecf008', '967c04df-26b2-4b64-9629-696ab31604bc', 'user', '2026-03-05T12:04:21.094194+00:00'),
('162c15ef-a610-4534-b325-7b10573409da', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'user', '2026-03-11T23:41:28.980619+00:00'),
('91188ba0-fa26-4699-bbcd-710805d19126', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'user', '2026-03-20T19:15:46.153443+00:00'),
('7665561b-65ad-491c-9769-39928a9934ef', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'user', '2026-03-20T20:38:11.181111+00:00'),
('16fee887-4efb-4659-8c3a-1f4029aceeb1', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'admin', '2026-02-02T21:11:07.679709+00:00'),
('53ccf569-d9c4-4e59-a771-67b3375715ad', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'user', '2026-03-27T12:15:11.356253+00:00'),
('2f8210d2-b90c-4061-8caf-8333e91347e0', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'user', '2026-03-30T12:24:45.6898+00:00'),
('148eba92-8748-4e82-92fd-d77b11a7d3eb', '90a3185a-e962-4928-991d-8220e5bc27ea', 'user', '2026-03-30T16:08:32.710065+00:00'),
('e4c19ffb-9d1e-4cab-b505-5f7508c55f04', '403f661c-db70-4a5a-9c00-a966909b707c', 'user', '2026-03-31T20:28:56.323915+00:00'),
('51f1bd31-6b25-4820-8d60-5035d7d303cc', '01d882a1-96f8-42a5-868a-64c7e0a042d9', 'user', '2026-03-31T20:38:15.833946+00:00'),
('dbf2abb7-5c36-492e-a4f6-25652c02fd42', 'b1c70b99-362b-4541-83eb-4643682d3eee', 'user', '2026-03-31T21:17:11.468239+00:00'),
('03d32382-b7f8-4a66-8682-16f55d2201d2', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', 'user', '2026-03-31T21:51:29.019095+00:00'),
('86fe394f-474b-4437-856b-a2a491034405', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'user', '2026-03-31T22:04:00.626312+00:00'),
('d432402c-6b98-4a7f-a943-59372e605b00', 'd77585f7-80ac-4466-8f7e-df2f56f14961', 'user', '2026-03-31T22:05:26.30426+00:00'),
('a347451f-3fd8-46dc-ad06-bf7a7d2da768', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'user', '2026-03-31T22:17:27.98138+00:00'),
('4d521e11-2fd9-44a3-aa5c-358598f94fd4', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'user', '2026-03-31T22:37:26.696145+00:00'),
('f5bb814b-0493-40d5-a411-b3b1b87196ec', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'user', '2026-03-31T23:27:40.504544+00:00'),
('4d5d5dda-69fa-4ffd-adf7-227217fb8f3c', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'user', '2026-04-01T00:39:39.716508+00:00'),
('c7ac87fb-fce6-4649-8ae9-49d7080f61b4', '223b6fad-06f4-4aac-b203-a6486f05ee0a', 'user', '2026-04-01T19:25:35.259361+00:00'),
('f93b2f4e-39eb-4a82-bafb-e67e672412ad', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', 'user', '2026-04-01T21:57:14.38156+00:00'),
('93f591d8-948c-43a6-b454-210d6c7d4446', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'user', '2026-04-02T00:09:34.919695+00:00'),
('2f2e3442-c21f-419e-ab9d-c89ab08c79c6', '89334953-16df-4963-a464-19a4af258542', 'user', '2026-04-02T05:43:30.943491+00:00'),
('859e34c0-72d4-487e-9d82-d482804a7c83', 'd7018362-2172-4735-8ab5-32acef7b824f', 'user', '2026-04-06T18:53:24.961292+00:00'),
('4a787497-e29c-4de3-aac1-862a15b813ef', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', 'user', '2026-04-14T12:12:45.025766+00:00'),
('5f900edc-f120-4a7f-8ca8-7f4dc3ac8da0', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', 'user', '2026-04-21T18:21:46.650352+00:00'),
('eceecb20-6bf4-4e84-bde9-962e7b12a46e', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'user', '2026-04-23T00:59:13.896293+00:00'),
('fb60ccdd-e1c6-4c88-ae8d-50e55492990f', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', 'user', '2026-05-06T03:08:36.510065+00:00'),
('39484bd3-261a-47b5-8e75-06697e029097', '2422b3dc-6627-4f1a-8c23-42683239a614', 'user', '2026-05-09T19:34:52.519105+00:00'),
('9637592c-414b-4c75-b740-926c4ef8ca37', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'user', '2026-05-30T13:45:15.712402+00:00'),
('a15fc737-f98e-48b2-8cf3-2d82a71bf5c2', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'user', '2026-05-30T13:51:27.213187+00:00'),
('f2d72174-d601-4efb-9823-b63678e8bab4', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'user', '2026-07-04T14:43:44.718041+00:00'),
('53543f71-7db5-4119-9324-1977e2ed7df9', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'user', '2026-07-14T20:19:49.026148+00:00'),
('542dcae0-5afd-4f14-ba3b-186707b9c49d', '0f97ccd5-ddb0-4af5-a600-1354560220c5', 'user', '2026-07-17T13:29:30.546455+00:00');

insert into public.receipts (id, user_id, establishment_id, purchase_value, points_earned, status, protocol_number, image_path, reviewed_by, reviewed_at, created_at, updated_at) values
('3a41791c-3d91-4314-a899-6c22e2eb82ca', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 10000.0, 100000, 'approved', 'PR-20260216-000072', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f/6d7a13d1-8f5b-4c80-a3ea-8a3f97678e39.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-16T19:01:00.473+00:00', '2026-02-16T19:00:41.001755+00:00', '2026-02-16T19:01:00.83436+00:00'),
('2793d8fd-f3fa-4df8-8724-64318ce633fc', '01ab4b1c-bf88-456b-972e-1ea14cab9950', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 10000.0, 100000, 'approved', 'PR-20260216-000073', '01ab4b1c-bf88-456b-972e-1ea14cab9950/33b11543-93a4-48d7-82db-e2741770f6dc.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-16T19:01:36.184+00:00', '2026-02-16T19:01:06.864424+00:00', '2026-02-16T19:01:36.539928+00:00'),
('7a6c79c2-d637-4326-85f5-e6aaf1f6eb9e', 'af225822-0bb5-4699-8345-48d164b9b28e', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 10000.0, 100000, 'approved', 'PR-20260216-000074', 'af225822-0bb5-4699-8345-48d164b9b28e/5eff4a88-cded-4988-8fca-6cc3ff813023.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-16T19:53:11.535+00:00', '2026-02-16T19:52:49.302441+00:00', '2026-02-16T19:53:11.935552+00:00'),
('670b3f73-5da5-4876-83b0-f2982cdf5c78', '6477a155-8065-4f58-a910-308365a8e136', '75771fbf-9234-43c7-82fc-fcc1a1c16a10', 5000.0, 50000, 'approved', 'PR-20260216-000075', '6477a155-8065-4f58-a910-308365a8e136/bcab0ed0-2cd4-4918-9ec5-1aabd4faf9a6.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-16T19:53:43.111+00:00', '2026-02-16T19:53:21.823818+00:00', '2026-02-16T19:53:43.508167+00:00'),
('40ff8287-ac20-4f5c-a179-8f14b0d2a606', '963a3921-096a-440e-a423-b6f398581b89', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 10.0, 100, 'approved', 'PR-20260227-000076', '963a3921-096a-440e-a423-b6f398581b89/9a3c07eb-efc6-4fb3-a3b5-2043953a2174.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-27T18:28:40.704+00:00', '2026-02-27T18:24:48.138624+00:00', '2026-02-27T18:28:41.019349+00:00'),
('61eb5851-5518-4f2f-bc78-8b3f362d3029', '963a3921-096a-440e-a423-b6f398581b89', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 10000.0, 100000, 'approved', 'PR-20260227-000077', '963a3921-096a-440e-a423-b6f398581b89/2a5d20a7-4e9d-4259-a650-338b210e402a.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-02-27T18:32:40.662+00:00', '2026-02-27T18:31:38.149259+00:00', '2026-02-27T18:32:40.973055+00:00'),
('da4366ee-4590-435e-8c48-0e720e413b5f', '63c418aa-5005-4487-bbcf-452a57a98724', '7c695362-2c22-4fe9-9fb5-b75d6aa1d19a', 10000.0, 100000, 'approved', 'PR-20260327-000080', '63c418aa-5005-4487-bbcf-452a57a98724/8f1bede6-d363-4384-bd68-8c541d72eff5.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-03-27T12:04:20.536+00:00', '2026-03-27T12:03:10.7371+00:00', '2026-03-27T12:04:22.929465+00:00'),
('b627eee5-51d2-4a24-b6ce-a4d0b4d42e2e', '720ad13b-b5b9-41c9-b752-c40c01616ce8', '75771fbf-9234-43c7-82fc-fcc1a1c16a10', 18.99, 189, 'pending', 'PR-20260331-000083', '720ad13b-b5b9-41c9-b752-c40c01616ce8/11db909d-6049-4f32-b3c5-92bceb0792d2.jpg', NULL, NULL, '2026-03-31T22:21:02.045658+00:00', '2026-03-31T22:21:02.045658+00:00'),
('6916b59f-accf-4382-8c1c-590efc42dd30', 'd7018362-2172-4735-8ab5-32acef7b824f', '75771fbf-9234-43c7-82fc-fcc1a1c16a10', 20.0, 200, 'pending', 'PR-20260406-000086', 'd7018362-2172-4735-8ab5-32acef7b824f/d6b09eeb-bf1d-4a25-8027-41c4925b68d2.jpg', NULL, NULL, '2026-04-06T18:58:07.697338+00:00', '2026-04-06T18:58:07.697338+00:00'),
('baa0a7ef-3b06-4cd3-aeea-830c56b7deab', 'd7018362-2172-4735-8ab5-32acef7b824f', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 28.0, 280, 'pending', 'PR-20260417-000087', 'd7018362-2172-4735-8ab5-32acef7b824f/a2fa5b23-fd6c-4e62-be06-9977262b90d8.jpg', NULL, NULL, '2026-04-17T13:34:22.891342+00:00', '2026-04-17T13:34:22.891342+00:00'),
('db36a97f-d907-4e04-a624-b67850678457', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 25.95, 259, 'rejected', 'PR-20260320-000078', 'e7a0789b-f987-4d56-aac7-391e07392b8b/9dc0fc8b-5a7d-4277-9f04-99ff9592d374.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-04T14:46:36.225+00:00', '2026-03-20T19:23:40.945846+00:00', '2026-07-04T14:46:36.500334+00:00'),
('eea0ebdb-13d8-4ab2-a6ed-72ae89af624a', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 25.95, 259, 'rejected', 'PR-20260320-000079', 'e7a0789b-f987-4d56-aac7-391e07392b8b/216f6108-cbf6-44cb-9bb5-9605f1653f1f.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-04T14:46:45.453+00:00', '2026-03-20T19:33:59.904602+00:00', '2026-07-04T14:46:45.732296+00:00'),
('903eb455-5b0d-4ceb-bb22-b035a4518b9b', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 25.95, 259, 'rejected', 'PR-20260327-000081', 'e7a0789b-f987-4d56-aac7-391e07392b8b/27893ab2-162b-4f87-a83a-9dcab6d726b0.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-04T14:46:49.244+00:00', '2026-03-27T13:13:39.770715+00:00', '2026-07-04T14:46:49.523819+00:00'),
('a35ad4b9-7c5e-4607-9a2a-ee05c649346e', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 25.95, 259, 'rejected', 'PR-20260327-000082', 'e7a0789b-f987-4d56-aac7-391e07392b8b/bb2e564e-04d9-4944-9caf-1564e784386e.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-04T14:46:56.786+00:00', '2026-03-27T13:16:10.970968+00:00', '2026-07-04T14:46:57.055086+00:00'),
('837bfedc-8ada-4944-be4e-560b430bc155', '81327958-0ca5-47ba-a274-0fd3acfca3e6', '2b6fdac4-dde1-4322-8fda-343bc7d98bff', 3000.0, 30000, 'approved', 'PR-20260704-000088', '81327958-0ca5-47ba-a274-0fd3acfca3e6/672a75d6-70e7-4a09-8ac8-30c9799a2f6a.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-04T14:53:44.214+00:00', '2026-07-04T14:53:32.957102+00:00', '2026-07-04T14:53:44.500581+00:00'),
('ef627952-17aa-4b4a-ac4c-bccf06464cdc', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'ce21bc5a-abe7-460a-9c1a-61a9a567658c', 1000.0, 10000, 'approved', 'PR-20260714-000089', '5338ad66-e1ec-481d-ae32-7b68f6061469/3f909908-8236-4a89-b5a0-c3990c4ab569.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-14T20:49:14.628+00:00', '2026-07-14T20:48:51.694558+00:00', '2026-07-14T20:49:14.744411+00:00'),
('4bea751a-9411-4293-9448-7643be301a3b', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'ce21bc5a-abe7-460a-9c1a-61a9a567658c', 80.0, 800, 'rejected', 'PR-20260331-000084', '7ece4ee9-29b4-4d61-8d44-662227efcb2c/7ee678c6-e6d5-44d8-9d99-c6736bb33c63.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-17T11:20:43.719+00:00', '2026-03-31T22:41:44.522151+00:00', '2026-07-17T11:20:45.678106+00:00'),
('b0fd4ad4-b848-4290-9dd2-4880b73a0d2a', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'ce21bc5a-abe7-460a-9c1a-61a9a567658c', 50.33, 503, 'rejected', 'PR-20260401-000085', 'de047af9-899b-46db-8ae2-f46f5a19967b/a774a827-2447-445a-93dd-6df9b20dc74e.jpg', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '2026-07-17T11:20:43.719+00:00', '2026-04-01T00:22:43.673234+00:00', '2026-07-17T11:20:45.67685+00:00');

insert into public.redemptions (id, user_id, product_id, points_spent, status, created_at, updated_at, delivery_cep, delivery_address, delivery_number, delivery_neighborhood, delivery_city, delivery_state) values
('b966fe71-8e28-430a-bacb-7fc9046258bf', '963a3921-096a-440e-a423-b6f398581b89', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-02-27T18:37:20.802221+00:00', '2026-02-27T18:42:45.179721+00:00', NULL, NULL, NULL, NULL, NULL, NULL),
('2208b8ee-bad7-468b-8df3-7eee8ddf1b81', '63c418aa-5005-4487-bbcf-452a57a98724', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-03-27T12:06:31.206046+00:00', '2026-03-27T12:07:02.439128+00:00', '46445-000', 'Rua sem nome', '20', 'Centro', 'Carinhanha', 'BA'),
('1711e213-1ca1-48f9-8a1f-3d58fd9bc58e', '963a3921-096a-440e-a423-b6f398581b89', '6d7cc5a5-d4e7-4abb-98c8-e0b2164eb7b3', 80000, 'cancelled', '2026-02-27T18:43:04.100557+00:00', '2026-07-04T14:56:24.847308+00:00', '46445-000', 'Rua Santos dumont', '79', 'São Francisco', 'Carinhanha', 'BA'),
('18256932-95bf-4af6-8bfe-4991f782ab0c', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'c10eba08-838c-4c82-ad6e-3afbfde94354', 20000, 'completed', '2026-07-04T14:56:28.400801+00:00', '2026-07-04T14:56:39.973984+00:00', '46445-000', 'Rua nova', '5', 'Alto da Colina', 'Carinhanha', 'BA'),
('d3ca8401-aa09-4d1b-8293-78c22c484527', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-07-14T20:55:03.050227+00:00', '2026-07-14T20:56:29.483506+00:00', '46445-000', 'Antônio Abreu', '64', 'Alto da colina', 'Carinhanha', 'BA'),
('cc8c19b9-1243-4082-85b7-f5534c165be8', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-02-16T19:02:53.436504+00:00', '2026-02-16T19:03:24.264745+00:00', '46445-000', 'Rua Bahia', '60', 'São Francisco', 'Carinhanha', 'BA'),
('0e144ff4-b4ec-4ef0-b28f-27e0c0e4871f', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', '6d7cc5a5-d4e7-4abb-98c8-e0b2164eb7b3', 80000, 'completed', '2026-02-16T19:04:33.016705+00:00', '2026-02-16T19:53:02.612761+00:00', '46445-000', 'Rua Ipiranga', '107', 'Centro', 'Carinhanha', 'BA'),
('20a42b06-76f2-43e3-b2fe-0eccd1306a67', '6477a155-8065-4f58-a910-308365a8e136', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-02-16T19:54:31.018958+00:00', '2026-02-16T19:55:05.383878+00:00', '46445-000', 'Rua vista algre', '823', 'Alto da colina', 'Carinhanha', 'BA'),
('6ed54e61-ba42-4060-911b-aef47d3e84a5', 'af225822-0bb5-4699-8345-48d164b9b28e', 'c8064d44-868b-4676-8e84-129cc9c099e7', 52000, 'completed', '2026-02-16T20:09:00.847895+00:00', '2026-02-16T20:10:10.186322+00:00', '46445-000', 'Rua Osvaldo Oliveira', '6', 'São João', 'Carinhanha', 'BA'),
('f7cc7fd6-e171-4bc8-bf2b-077654c796cb', 'af225822-0bb5-4699-8345-48d164b9b28e', 'f4201620-985f-454a-8b26-41b3bc1fc45a', 20000, 'completed', '2026-02-16T20:08:22.923874+00:00', '2026-02-16T20:10:11.632794+00:00', '46445-000', 'Rua Osvaldo Oliveira', '6', 'São João', 'Carinhanha', 'BA'),
('42b4f61f-d7c5-4a38-8b34-61b64e2b64ac', 'af225822-0bb5-4699-8345-48d164b9b28e', 'f901950b-8451-4031-a89d-d5605faaf66f', 4000, 'completed', '2026-02-16T20:07:47.274595+00:00', '2026-02-16T20:10:12.792848+00:00', '46445-000', 'Rua Osvaldo Oliveira', '6', 'São João', 'Carinhanha', 'BA'),
('bbd2ce06-a3d2-40f5-87fb-63e5a18cf241', 'af225822-0bb5-4699-8345-48d164b9b28e', 'f6bc1d5d-7a65-4cfc-8321-eacba3f9e9ef', 8000, 'completed', '2026-02-16T20:07:01.078655+00:00', '2026-02-16T20:10:14.571993+00:00', '46445-000', 'Rua Osvaldo Oliveira', '6', 'São João', 'Carinhanha', 'BA');

insert into public.points_ledger (id, user_id, ledger_type, amount, receipt_id, redemption_id, expires_at, created_at) values
('9f7d1fa7-193a-4637-ad65-0374e399cb9a', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'earn', 100000, '3a41791c-3d91-4314-a899-6c22e2eb82ca', NULL, '2027-02-16T19:01:00.83436+00:00', '2026-02-16T19:01:00.83436+00:00'),
('ecb17d16-ef26-4862-ae88-9dbd6f1a31bc', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'earn', 100000, '2793d8fd-f3fa-4df8-8724-64318ce633fc', NULL, '2027-02-16T19:01:36.539928+00:00', '2026-02-16T19:01:36.539928+00:00'),
('9cfe0397-0b14-4d56-bce4-48dbdb931546', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'redeem', -8000, NULL, 'cc8c19b9-1243-4082-85b7-f5534c165be8', NULL, '2026-02-16T19:02:53.436504+00:00'),
('127d2325-6f05-424e-b6a0-6b5b79f7134b', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'redeem', -80000, NULL, '0e144ff4-b4ec-4ef0-b28f-27e0c0e4871f', NULL, '2026-02-16T19:04:33.016705+00:00'),
('dc850298-efda-41eb-a237-4986af7b373b', 'af225822-0bb5-4699-8345-48d164b9b28e', 'earn', 100000, '7a6c79c2-d637-4326-85f5-e6aaf1f6eb9e', NULL, '2027-02-16T19:53:11.935552+00:00', '2026-02-16T19:53:11.935552+00:00'),
('8743a84c-d77c-41ce-8a1e-e0ba1e52b68f', '6477a155-8065-4f58-a910-308365a8e136', 'earn', 50000, '670b3f73-5da5-4876-83b0-f2982cdf5c78', NULL, '2027-02-16T19:53:43.508167+00:00', '2026-02-16T19:53:43.508167+00:00'),
('367f430b-fa4e-41e7-8ceb-a055551e5531', '6477a155-8065-4f58-a910-308365a8e136', 'redeem', -8000, NULL, '20a42b06-76f2-43e3-b2fe-0eccd1306a67', NULL, '2026-02-16T19:54:31.018958+00:00'),
('8599cda8-8147-494f-b584-49c4c5161842', 'af225822-0bb5-4699-8345-48d164b9b28e', 'redeem', -8000, NULL, 'bbd2ce06-a3d2-40f5-87fb-63e5a18cf241', NULL, '2026-02-16T20:07:01.078655+00:00'),
('05f42116-3f8d-4ee0-a472-358208d8571b', 'af225822-0bb5-4699-8345-48d164b9b28e', 'redeem', -4000, NULL, '42b4f61f-d7c5-4a38-8b34-61b64e2b64ac', NULL, '2026-02-16T20:07:47.274595+00:00'),
('938ba7d6-81a6-4e26-98a1-60119cf7f128', 'af225822-0bb5-4699-8345-48d164b9b28e', 'redeem', -20000, NULL, 'f7cc7fd6-e171-4bc8-bf2b-077654c796cb', NULL, '2026-02-16T20:08:22.923874+00:00'),
('466bd3ea-629e-44ae-a512-e15b4176f390', 'af225822-0bb5-4699-8345-48d164b9b28e', 'redeem', -52000, NULL, '6ed54e61-ba42-4060-911b-aef47d3e84a5', NULL, '2026-02-16T20:09:00.847895+00:00'),
('27a8a5bd-a7b5-4128-a4fe-c7cc5b732206', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'adjustment', 100, NULL, NULL, NULL, '2026-02-20T17:53:30.348786+00:00'),
('e550e6fd-8745-48ae-9f33-1f73084c7e58', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'adjustment', 100, NULL, NULL, NULL, '2026-02-20T17:58:09.403184+00:00'),
('bdb05bce-de30-46e3-9efb-68e54ca45922', '963a3921-096a-440e-a423-b6f398581b89', 'earn', 100, '40ff8287-ac20-4f5c-a179-8f14b0d2a606', NULL, '2027-02-27T18:28:41.019349+00:00', '2026-02-27T18:28:41.019349+00:00'),
('1ac41ab3-1c27-4736-9d28-d48e50299025', '963a3921-096a-440e-a423-b6f398581b89', 'earn', 100000, '61eb5851-5518-4f2f-bc78-8b3f362d3029', NULL, '2027-02-27T18:32:40.973055+00:00', '2026-02-27T18:32:40.973055+00:00'),
('5def1f4c-c994-4f71-94af-2e55a4deec1a', '963a3921-096a-440e-a423-b6f398581b89', 'redeem', -8000, NULL, 'b966fe71-8e28-430a-bacb-7fc9046258bf', NULL, '2026-02-27T18:37:20.802221+00:00'),
('a0115d1c-cc5b-43c2-ab6a-acdbc58457a8', '963a3921-096a-440e-a423-b6f398581b89', 'redeem', -80000, NULL, '1711e213-1ca1-48f9-8a1f-3d58fd9bc58e', NULL, '2026-02-27T18:43:04.100557+00:00'),
('9d8061c6-3123-42a8-80cd-39da905b1025', '63c418aa-5005-4487-bbcf-452a57a98724', 'earn', 100000, 'da4366ee-4590-435e-8c48-0e720e413b5f', NULL, '2027-03-27T12:04:22.929465+00:00', '2026-03-27T12:04:22.929465+00:00'),
('2c308cde-6c9f-40ee-bc5e-b1a948780387', '63c418aa-5005-4487-bbcf-452a57a98724', 'redeem', -8000, NULL, '2208b8ee-bad7-468b-8df3-7eee8ddf1b81', NULL, '2026-03-27T12:06:31.206046+00:00'),
('e17aff02-c557-4f95-a34d-7e986fe2c8c2', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'earn', 30000, '837bfedc-8ada-4944-be4e-560b430bc155', NULL, '2027-07-04T14:53:44.500581+00:00', '2026-07-04T14:53:44.500581+00:00'),
('8c5e295d-b4ec-4de6-b47b-d99fb69e62ba', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'redeem', -20000, NULL, '18256932-95bf-4af6-8bfe-4991f782ab0c', NULL, '2026-07-04T14:56:28.400801+00:00'),
('4da87770-4dfd-4bcc-aad6-bfe8417b066e', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'earn', 10000, 'ef627952-17aa-4b4a-ac4c-bccf06464cdc', NULL, '2027-07-14T20:49:14.744411+00:00', '2026-07-14T20:49:14.744411+00:00'),
('9d49fac4-ffee-413e-a028-79eda1206a39', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'redeem', -8000, NULL, 'd3ca8401-aa09-4d1b-8293-78c22c484527', NULL, '2026-07-14T20:55:03.050227+00:00');

insert into public.notifications (id, user_id, title, message, is_read, created_at, tipo, arquivada) values
('f02e5c83-5a3f-49e8-a8fc-defbbb10a7e0', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Resgate aprovado', 'Seu resgate do prêmio Ventilador Mesa Super Turbo 8 Pás Mondial Vtx-40-crystal foi aprovado e será enviado em breve.', false, '2026-02-16T19:53:02.612761+00:00', 'resgate_aprovado', false),
('fc258790-935e-4437-b149-4aaa79e9b126', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', false, '2026-02-16T19:53:11.935552+00:00', NULL, false),
('a63894e4-94ef-4208-b21c-4cd3ab2f3c8a', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Resgate aprovado', 'Seu resgate do prêmio  Gás Glp Com 13 Kg foi aprovado e será enviado em breve.', false, '2026-02-16T20:10:10.186322+00:00', 'resgate_aprovado', false),
('3d4033b6-715f-4dc9-9d43-de1547808ed4', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', false, '2026-02-16T20:10:11.632794+00:00', 'resgate_aprovado', false),
('85a7c736-3ca6-42ec-942f-fd0d407cbddf', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', true, '2026-02-16T19:01:00.83436+00:00', NULL, false),
('0a5f5161-2474-4e60-8fb2-11a590b2a71e', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', false, '2026-02-16T20:10:12.792848+00:00', 'resgate_aprovado', false),
('9cb31b25-261b-459f-ba34-ba95de8129cf', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', false, '2026-02-16T20:10:14.571993+00:00', 'resgate_aprovado', false),
('d2f87186-1706-461a-89d0-d52c94d61ba0', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', false, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', false),
('352cc4cd-b260-4f52-8bf9-a8f9895adaf5', 'af225822-0bb5-4699-8345-48d164b9b28e', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', false, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', false),
('4f286292-6eb9-4192-80f8-21743de79fe4', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', false, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', false),
('5be958c8-f599-4aec-8c91-1b18fef182c5', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', true, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', false),
('72b7a0e6-8918-42aa-a8bb-e628bcc50ee9', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'teste', '[Refrigera Mais] teste teste teste', false, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', false),
('0c9dce01-25e0-43be-acab-4247933ec81b', 'af225822-0bb5-4699-8345-48d164b9b28e', 'teste', '[Refrigera Mais] teste teste teste', false, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', false),
('163027c2-0689-440a-b9f9-44c1367c1622', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'teste', '[Refrigera Mais] teste teste teste', false, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', false),
('d2664d1f-509c-40ef-b8b8-39f89c691442', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'teste', '[Refrigera Mais] teste teste teste', false, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', false),
('8d6e2cbc-8089-4a88-8ee3-32e6aea50cb9', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', true, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', true),
('2ef3744f-fd32-4f45-9ed9-8e9094ac2271', '6477a155-8065-4f58-a910-308365a8e136', 'Comprovante aprovado', 'Seu comprovante da loja Refrigera Mais foi aprovado. Os pontos já foram creditados.', true, '2026-02-16T19:53:43.508167+00:00', NULL, false),
('0ec5dfda-219b-4411-8728-7b8e317160c6', '6477a155-8065-4f58-a910-308365a8e136', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', true, '2026-02-16T19:55:05.383878+00:00', 'resgate_aprovado', false),
('32f525aa-33e5-4d20-a863-d771bc58cae5', '63c418aa-5005-4487-bbcf-452a57a98724', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', true, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', true),
('4a50a041-2ee5-498c-bffe-6b4607796ba0', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'teste', '[Refrigera Mais] teste teste teste', true, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', true),
('bf37ba48-e64b-4feb-91bb-1256ef9d928f', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'teste', '[Refrigera Mais] teste teste teste', true, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', true),
('704e4327-5a58-4878-872b-e94a29ff4721', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', true, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', true),
('26da4dd6-84de-46fc-98b7-f70090e5fa2c', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('9a38ea5d-1d87-4e1c-92c6-326fff0bfb72', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('992b0e0c-13c9-407e-9be8-a6e08a6abdc4', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('5582d7c6-1bd1-4648-b8ff-204b94253b54', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('77ca8c7a-602e-4d64-817a-fe64cd85511e', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('04f4c697-80ab-484f-9e5f-3a9852540bc6', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('fa9ad90e-8257-47c9-a356-c6a373029046', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('f020166a-e01b-49ee-9d36-c5affadc9591', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', true),
('aec12f9a-b98d-4f14-b3a7-718af830bfa2', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', true, '2026-02-16T19:01:36.539928+00:00', NULL, true),
('28fb1961-ddf8-4986-ad09-ef38e75f71eb', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', true, '2026-02-16T19:03:24.264745+00:00', 'resgate_aprovado', true),
('a62a7fad-3213-4bd0-856d-f6087a80be91', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', false, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', true),
('f8ff7acd-37fd-4b97-b9a3-49fa8514233d', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'teste', '[Refrigera Mais] teste teste teste', false, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', true),
('c9960db1-47d6-418f-bbbb-e25e12cdff9d', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', false, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', true),
('55840f78-ee95-4d60-a848-8568d9f20bc6', '6477a155-8065-4f58-a910-308365a8e136', 'loja com 70% de desconto', 'shgaldsjkhgksdhgkhsghkdsjghdçsahanjsloikg', true, '2026-02-20T18:29:35.524181+00:00', 'campanha_promocional', false),
('63d45556-c733-4447-b7a9-b34816d31994', '6477a155-8065-4f58-a910-308365a8e136', 'teste', '[Refrigera Mais] teste teste teste', true, '2026-02-20T18:31:17.709588+00:00', 'campanha_promocional', false),
('ad7b832d-35d9-4f1e-9d51-fdd6515d4584', '6477a155-8065-4f58-a910-308365a8e136', 'Lançamento.', 'Vem aí o lançamento do Meu Resgate!', true, '2026-02-26T13:58:16.791881+00:00', 'campanha_promocional', false),
('ffd9927a-ee9a-4fd3-86ae-9d42f2887d6a', '63c418aa-5005-4487-bbcf-452a57a98724', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', true, '2026-03-27T12:07:02.439128+00:00', 'resgate_aprovado', true),
('2beec6d2-3914-454a-83b7-924948bbf086', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Comprovante rejeitado', 'Seu comprovante da loja Atacadão do Del foi rejeitado. Verifique as informações enviadas.', false, '2026-07-04T14:46:45.732296+00:00', NULL, false),
('fd522c35-b81e-446f-bfe9-5e3c29425bcc', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('c045ce17-3f7b-4889-9130-8cee13d1bca9', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('1ae49222-f82e-484a-ada3-78c60cb11d76', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('146cebdd-c6b5-484b-bb11-d009c442c3ec', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', true),
('08a8d8f8-ddee-4456-b14f-6d95c19f1e17', '963a3921-096a-440e-a423-b6f398581b89', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', false, '2026-02-27T18:28:41.019349+00:00', NULL, false),
('0748f0c1-5d71-4ea5-8cf9-301acdfe2c35', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', true),
('2a0e5754-1686-4842-a25b-f509a76477f4', '6477a155-8065-4f58-a910-308365a8e136', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', true, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('923946d8-738e-4123-9153-224454bb3dc4', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Comprovante rejeitado', 'Seu comprovante da loja Atacadão do Del foi rejeitado. Verifique as informações enviadas.', false, '2026-07-04T14:46:49.523819+00:00', NULL, false),
('4df3e9c3-8f2d-4542-9a64-0d0133f42abe', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('f9c7ce81-ebcf-4e82-a8bf-3221f06ccecf', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('4474b350-6855-49bd-9b03-ceb452db2402', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', false, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('dc599e4d-8773-4816-8d36-5750e91d6c64', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('c0894fb5-c302-4ee4-a2b2-a78dc7f3d407', '963a3921-096a-440e-a423-b6f398581b89', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', false, '2026-02-27T18:32:40.973055+00:00', NULL, false),
('a1d14c11-f4be-46a8-9711-d18ec7fd6aea', '01ab4b1c-bf88-456b-972e-1ea14cab9950', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', true),
('ccf470de-b4ea-4ec0-9be2-1457a65b47e7', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Comprovante rejeitado', 'Seu comprovante da loja Atacadão do Del foi rejeitado. Verifique as informações enviadas.', false, '2026-07-04T14:46:57.055086+00:00', NULL, false),
('dfa46b95-c3d0-489d-8655-86c4eb2ac9db', 'af225822-0bb5-4699-8345-48d164b9b28e', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('c96e834a-5d28-4378-af00-f937dda04825', '550215d8-6b1f-4c04-8f50-b7e38def45c2', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('1c65edc0-1b8c-4895-bd2d-1565e4966b83', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('0ea84bfc-2688-4474-b683-c6c60bed4366', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('5fdb0cac-761b-48c2-990a-d7247364abcc', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', true),
('4e74a2d7-9190-4d01-a7a5-c3d24d9f83e0', '963a3921-096a-440e-a423-b6f398581b89', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', false, '2026-02-27T18:38:24.64658+00:00', 'resgate_aprovado', false),
('71caec2b-9814-40f2-bb7e-fc316500d795', '6477a155-8065-4f58-a910-308365a8e136', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', true, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('748f5864-58f8-4089-ab1e-1a4c6fe44d7a', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'Comprovante aprovado', 'Seu comprovante da loja Atacadão do Del foi aprovado. Os pontos já foram creditados.', true, '2026-07-04T14:53:44.500581+00:00', NULL, false),
('e38ca2de-f20b-4db2-9dac-35f78c1c284d', '6477a155-8065-4f58-a910-308365a8e136', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('6c4b170c-d3ec-468d-ba13-7d6a814034c6', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', true),
('4925239b-0f21-4766-8964-43185bd1ed83', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('29b775e1-fdba-41a3-9605-f296daec94c6', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', true, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', false),
('e7ea4cf7-323e-416a-87bf-c97a49db2cf2', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('896e8ee1-4157-444d-872e-de0bcf808523', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', true, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', false),
('f277d947-94c1-4727-8b48-fa7906f1c0b0', '63c418aa-5005-4487-bbcf-452a57a98724', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', true, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', true),
('1e4a1e64-5853-4bf5-8ef5-20782a7a427e', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', true),
('b70c028b-c346-4974-b7fe-7d0902cf69e4', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('f80dd4a4-dc0f-4a1e-8674-5759a942456d', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('b251b0ce-d22a-4934-bda4-0814f566c113', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('b9718ce5-2b7c-4d71-b974-29c63ec6798a', 'af225822-0bb5-4699-8345-48d164b9b28e', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('f3dc5e27-f1c1-4495-a04e-3427f3ab81ea', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('d63cf0d3-53a6-41bb-9366-f329c0a3a8f5', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('b3b01411-bff2-4488-8f47-a71135446e08', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('dabe4646-3d08-47c3-bcb9-8111f210a0a5', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('379f9d5f-fc90-44f4-98d4-8f0f8e0bf8ee', '6477a155-8065-4f58-a910-308365a8e136', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', true, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('2ef83321-8905-48f9-8384-ae9e5e349175', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'Resgate aprovado', 'Seu resgate do prêmio Voucher Pães 10 Unidades foi aprovado e será enviado em breve.', true, '2026-07-04T14:56:39.973984+00:00', 'resgate_aprovado', false),
('23ce3aba-d937-40fc-91da-fccafa35a68b', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('b3e2061b-c09b-4550-8046-f285fd8dc755', 'b1c70b99-362b-4541-83eb-4643682d3eee', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('3a298c9a-6b90-47c9-b878-4c85b6c98c7d', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', false),
('98408516-444e-406e-829d-4422b8fe0bff', '63c418aa-5005-4487-bbcf-452a57a98724', 'Campanha Teste!', 'Texto aqui 2026 Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqui 2026Texto aqu', true, '2026-02-26T13:59:15.619869+00:00', 'campanha_promocional', true),
('a921b617-a99c-4847-b986-591b2c9ef4f3', '63c418aa-5005-4487-bbcf-452a57a98724', '1 a 277', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277', false, '2026-02-26T14:08:26.789478+00:00', 'campanha_promocional', true),
('b93cc2b0-1f19-4b8d-8ef3-61a65f419e1f', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'TESTE', '[Atacadão do Del] Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', true, '2026-02-26T14:36:04.505841+00:00', 'campanha_promocional', true),
('760842e2-16f0-4b65-a285-6cc4db21b515', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('29a6fa12-22fc-4ae2-bc02-87b2bf07aeab', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', true),
('41196e6d-abed-4917-92cc-d5ef34965906', '63c418aa-5005-4487-bbcf-452a57a98724', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', true, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', true),
('41d98254-f6d3-413d-92c2-fe8f69e21e63', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'Comprovante aprovado', 'Seu comprovante da loja Loja teste foi aprovado. Os pontos já foram creditados.', true, '2026-07-14T20:49:14.744411+00:00', NULL, false),
('87b60194-ae5f-4884-b0f8-6127d50d1602', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'Comprovante rejeitado', 'Seu comprovante da loja Loja teste foi rejeitado. Verifique as informações enviadas.', false, '2026-07-17T11:20:45.67685+00:00', NULL, false),
('7f376e5d-fa18-43eb-91df-f2205d0964a0', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'Comprovante rejeitado', 'Seu comprovante da loja Loja teste foi rejeitado. Verifique as informações enviadas.', false, '2026-07-17T11:20:45.678106+00:00', NULL, false),
('6b893a80-0204-4712-b208-532073875c7c', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('e9d9973f-80fb-449c-8dc3-c7d218790a3e', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('fe014ba7-9222-4304-9c9e-af229088970e', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('f45cde33-a0ba-4455-9c43-0ba760b339ee', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('8cc1f1d7-7809-49c0-a514-5f5da4765e3b', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('1aa01709-7611-48e2-9843-11e6718fa855', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('79f1aa84-5e66-44be-8921-62299788c9cf', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('6bfd3e22-cf4e-49ea-b38e-bb053344157b', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', true),
('f85a3c99-4333-476b-8e2c-c5594d8cf93e', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('858b1203-0060-4987-aaee-6febeb361b47', '967c04df-26b2-4b64-9629-696ab31604bc', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('0089c903-ba39-43a5-8dc2-c771db16df0f', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', false, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', true),
('1e5cd853-1716-4a5f-8455-49cdb4c654dd', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('b28792ba-05dc-42a4-8aed-9c5fc0c92a2f', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('8b1bedee-1f9d-43cd-8ccc-6ae489aec1f8', '967c04df-26b2-4b64-9629-696ab31604bc', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('c6ac9438-c31f-4a71-b4b5-ddf7e4294a41', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('684c53be-e84a-4aee-811c-3b6824b771eb', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('3d6a59df-842b-42c2-80e2-8b5af66e3881', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('0a64fbb8-1502-408f-83e2-ff53a657e2c4', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('d83b3f37-0725-4b5d-a52f-9b77252d7c00', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('d67a9766-b2b9-447c-aabd-d6ea41d20dda', '6477a155-8065-4f58-a910-308365a8e136', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', true, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', false),
('35481a92-24ed-406c-8530-b8b53a512c69', '63c418aa-5005-4487-bbcf-452a57a98724', 'Junior TUR', 'A Junior TUR está sempre evoluindo para oferecer o melhor aos seus clientes, e agora temos uma van moderna e extremamente confortável para tornar suas viagens ainda mais agradáveis.

Mais espaço, mais comodidade e mais segurança para você viajar com tranquilidade. Na Junior TUR, cada detalhe é pensado para garantir qualidade, pontualidade e um atendimento de confiança. Porque quando o assunto é transporte, viajar bem faz toda a diferença.

Junior TUR — conforto, segurança e confiança em cada viagem. 🚐✨', false, '2026-03-11T23:47:59.218101+00:00', 'campanha_promocional', true),
('9e653bc1-e22c-4566-8c98-4cefba25e230', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('15e3dcc8-e3d3-4b0f-b6cb-e268582d82a0', '63c418aa-5005-4487-bbcf-452a57a98724', 'Comprovante aprovado', 'Seu comprovante da loja Ótica Santa Luzia foi aprovado. Os pontos já foram creditados.', true, '2026-03-27T12:04:22.929465+00:00', NULL, true),
('08d90999-0d30-4a06-8379-c6eb02a39ea1', '6477a155-8065-4f58-a910-308365a8e136', 'Inauguração', 'Vem aí algo GRANDE!

Prepare-se para um momento especial: está chegando a Mega Inauguração que vai movimentar a cidade!

Uma nova loja, um novo conceito e uma experiência pensada para surpreender você.
Serão ofertas exclusivas, condições especiais de inauguração, brindes, novidades incríveis e um ambiente preparado para receber você com todo carinho.

É mais do que abrir as portas…
É o início de uma nova história, feita para oferecer qualidade, economia e atendimento de primeira.

Anote na agenda e não fique de fora!
Em breve divulgaremos a data oficial.

✨ Grandes oportunidades
🎁 Promoções imperdíveis
🔥 Preços de inauguração
📍 Um novo ponto de economia e qualidade para você

A contagem regressiva já começou.
Vem aí… a Mega Inauguração que você estava esperando!', true, '2026-02-26T14:50:51.233045+00:00', 'campanha_promocional', false),
('b5ec62dd-5078-46ce-a607-a3fd8b0a0c5d', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('1d002a1f-ea52-43e9-9877-a69c14c7839f', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('be9e32b4-9045-4902-9581-ec18f17c5921', '967c04df-26b2-4b64-9629-696ab31604bc', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('697c4990-e29d-4aa3-b35f-e133214d4c03', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('595843bc-0caa-4830-9ae3-8a15eebd7528', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('d7158329-7a8f-484d-8711-776b8d180db1', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('ef356dd2-b873-446c-8068-9af36f2b2bd0', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('a43b29ac-6e02-4cd8-b5b4-98a6d5f4cf13', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('ce0c8b06-47b0-4ddd-a016-e6c31db77dbd', '6477a155-8065-4f58-a910-308365a8e136', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('14beff21-ed92-47fe-9853-6f962967ab2f', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('d0c97f17-0ca9-4ba0-916e-7029cfd36683', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('7ab4339b-f2d6-43ee-beee-ea88a1364402', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('67a52329-9da1-4700-a5aa-f9804447a28c', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('b6c20a71-f331-4134-a264-a367de43d95e', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('52699541-8a27-4141-89ca-cf039d63763a', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', true, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', false),
('0afa3748-2a82-41bb-a88c-5f0bf82acb16', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', true),
('0b1aae53-d8d0-407f-8024-9a3ff7fa5345', '63c418aa-5005-4487-bbcf-452a57a98724', 'Sorteio UniTV', '*ATENÇÃO, GALERA!*

Amanhã é dia de SORTEIO do BoxTV da UniTV!  Não perca a chance de levar esse prêmio incrível para casa! Fique ligado no APP. 

#UniTV #Sorteio #BoxTV', false, '2026-03-23T23:08:12.622005+00:00', 'campanha_promocional', true),
('87c093d0-2f36-4460-9b49-3c28ea005434', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('21a5f6fe-41fb-47af-91c1-287902062391', '63c418aa-5005-4487-bbcf-452a57a98724', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', true),
('3c611689-cb20-405e-918b-c70f19ed7ac3', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('9acc0c6e-b973-4b9b-a26d-4afa3d1f55e9', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('511e88c4-c9a2-497a-8af7-06f0ba9a26cc', '6df07bca-3e03-436b-a121-5aabdb507fa0', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('78382776-4052-4229-966d-1b3038a3d9e2', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('e3972d8c-db1f-4531-9fdb-eab7127f7468', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('ca2dc327-1a1b-49e6-98a5-c7868782bf3c', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('2259fbeb-99fd-490c-af4e-664f40571cef', '6477a155-8065-4f58-a910-308365a8e136', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('18ef93ea-99ea-4e62-ac11-bfe626fde301', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('9d0e0ce7-7be5-4412-8d30-cdb268cff12e', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('8084b3b3-f3ac-4080-9bd8-d0bbac1f7fd2', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('ca97a767-1da1-4135-9b2a-eaa8fe1313bc', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('bfec9e5f-c3fd-410e-8f10-d6927dd69c5d', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', false),
('cb85648a-b8fa-432c-802e-08a1b93d7378', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Comprovante rejeitado', 'Seu comprovante da loja Atacadão do Del foi rejeitado. Verifique as informações enviadas.', false, '2026-07-04T14:46:36.500334+00:00', NULL, false),
('17ff920b-6ae7-49a2-8bbc-817709963934', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'Resgate aprovado', 'Seu resgate do prêmio Voucher em Dinheiro foi aprovado e será enviado em breve.', true, '2026-07-14T20:56:29.483506+00:00', 'resgate_aprovado', false),
('0709f337-414b-463f-875e-fb277680c1d2', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Ótica', '[Ótica Santa Luzia] PEGUE A VISÃO

Agora ficou ainda mais fácil cuidar dos seus olhos!

A Ótica Santa Luzia agora faz parte do Meus Resgate.

Isso mesmo! Além de qualidade, confiança e aquele atendimento que você já conhece, agora você também pode aproveitar benefícios exclusivos na hora de cuidar da sua visão.

Quando o assunto é cuidado das vista, você já sabe.

O nome é Ótica Santa Luzia!

Não perca tempo, passe lá, aproveite as vantagens e veja o mundo com muito mais clareza!', false, '2026-03-27T12:08:47.936227+00:00', 'campanha_promocional', true),
('0d504be5-8556-4a53-8e11-972e1cd8365f', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('0d8d956a-7e1c-484d-9c5c-6bc31d60bb7d', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('391968df-59d7-45f5-a1a8-459d7c1d4730', '967c04df-26b2-4b64-9629-696ab31604bc', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('067736b0-1b6d-4e88-a1f7-202ffc4a1599', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('fcdff0b4-69ef-463b-b3a4-c4649a519021', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('a52df63a-a13a-4f4e-a26d-0ffccf204dff', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('6b1627b4-90ca-4d0b-b301-639cc5eef11d', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('9adde7c9-f609-476a-8954-0d3d81fd9044', '90a3185a-e962-4928-991d-8220e5bc27ea', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('22bc7b50-93a2-4624-811a-8b1df7ca40fb', '403f661c-db70-4a5a-9c00-a966909b707c', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('8b2f1cc5-eea4-4a61-96e2-7e8d1415955a', '01d882a1-96f8-42a5-868a-64c7e0a042d9', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('c24aa1c0-610c-4e24-b9f3-49ac144a9e4a', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('9ea6f3a5-9a29-481c-be81-779affdaaf26', '63c418aa-5005-4487-bbcf-452a57a98724', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', true),
('04a120f5-5c7a-4fb2-909d-1c3d93bc7d60', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('fb8b1246-7098-4bfc-9705-d2b4f7962ed6', '6477a155-8065-4f58-a910-308365a8e136', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('d56553bc-bdce-473a-914a-fe6ebe913d54', 'b1c70b99-362b-4541-83eb-4643682d3eee', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('3fc42356-b69c-4783-a075-357092419220', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('ed190bea-373a-4332-b8af-9c0275c122b9', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('10741749-6f8b-4c7b-8e00-350d79dab3f3', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('9927a8a9-7078-4bab-a8e2-1eed31f491ab', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('dde28616-2db3-4368-96ed-b6ab126b2715', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('766d1a1e-8267-4a39-a49f-23c5f4a6068e', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('7b159a29-5aa0-4840-85b7-e9d316f73f10', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('787e9c0d-5049-475b-9ea9-aa54f4772104', 'd77585f7-80ac-4466-8f7e-df2f56f14961', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('c221015d-bd6d-42c2-9fbd-dbc196ad3014', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('43a1fb5a-c631-45ea-a008-bafbc7835b3d', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('1e8c1366-134a-41ff-ad7b-f37b91283ce0', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('2a7c4bb6-8277-4004-9c06-9852aa98c1fb', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('52e11dd7-2224-4946-b4fa-14ba2d928a4a', '223b6fad-06f4-4aac-b203-a6486f05ee0a', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('45517b1c-04c3-4ecb-935c-ea6597613f52', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('08afc8f9-6117-47a7-99ad-baf88d57a0f0', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('59352622-b71a-4d0f-ac17-1b4083c9f1c7', '89334953-16df-4963-a464-19a4af258542', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('6dac020d-7aea-46f0-8d01-896bbb6b8d5d', 'd7018362-2172-4735-8ab5-32acef7b824f', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('4c20ad76-9ac7-47cb-a417-87b85072ccbc', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('d167780d-e14d-4ea8-86bc-20178171f6d3', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('648679c8-f14d-42d1-a456-65ffb6597f4f', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('dbf20026-741a-461e-b741-3b295653ee5f', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('c6204b4d-4ce0-4e32-8dd1-275cdacc30f2', '2422b3dc-6627-4f1a-8c23-42683239a614', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('4704c613-c3cb-48f5-9353-7e0db925c4f3', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('2de82bbd-7997-45e2-95fd-91339b87e6af', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('d7d38297-766b-41b2-a0aa-082c9c4508b5', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', true, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('4c5ea4df-3271-480a-a72b-4e6930c9e85d', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', false, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', true),
('0b413331-d573-4ff6-a93d-d7d6ed06f61f', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'Tráfego Pago', 'Quer vender mais e atrair clientes todos os dias?

Se você está em busca de um gestor de tráfego realmente especialista, fale com Igor!

Com estratégia, análise e campanhas otimizadas, ele trabalha para colocar sua empresa na frente das pessoas certas, aumentando as oportunidades de vendas e o retorno sobre o investimento.

Entre em contato agora mesmo: (77) 9859-3171

Invista em quem entende de tráfego pago e leve o seu negócio para o próximo nível!', true, '2026-07-04T15:00:23.443237+00:00', 'campanha_promocional', false),
('4b49c0d7-dade-4994-b661-87230b4e83fa', '63c418aa-5005-4487-bbcf-452a57a98724', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('783e3a73-017d-4c09-aa5c-af472fea1d11', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('847cad43-6927-40d7-b548-c9589481a4ec', '373bc3a3-07f4-48b3-80c9-caca530e9e09', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('6676f089-4089-4808-aae6-8dda16fa301b', '967c04df-26b2-4b64-9629-696ab31604bc', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('ce1f5568-0a70-4bb7-b0fa-c9d44a8d2578', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('9b99cabe-8d94-437f-b345-3905c22b0fd9', 'e7a0789b-f987-4d56-aac7-391e07392b8b', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('8e3b7450-e35b-4409-abc3-8d8fcf31d960', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('96cb919d-1710-45e3-b018-37e2c6ceed99', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('beaa2d22-33e3-436b-96f5-9ba884a54d84', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('5cd75227-69a3-4e7e-955d-7e84fab977a1', '90a3185a-e962-4928-991d-8220e5bc27ea', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('75e295e7-9ebe-458e-ae97-78136647d8f0', '403f661c-db70-4a5a-9c00-a966909b707c', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('f51e5b18-e2cd-4ab3-a3aa-2290eaed01b2', '01d882a1-96f8-42a5-868a-64c7e0a042d9', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('95f929a9-0b4c-4d4d-81b3-6638da2f8209', '01ab4b1c-bf88-456b-972e-1ea14cab9950', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('b60d41ff-797f-4adc-a1a3-b4f6f9848325', 'b27f0a8c-5550-4f8b-9fd0-648c0443208f', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('040d28d8-4901-43cb-83e1-92ccdd311b99', 'af225822-0bb5-4699-8345-48d164b9b28e', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('7e52e7f8-0577-4059-a4d3-29a85ae02986', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('e8f40300-0bc9-4ec3-87fe-1305abf320db', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('f8e4414c-be37-4e9f-a761-45835d7541d1', '550215d8-6b1f-4c04-8f50-b7e38def45c2', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('8de84368-3593-4ae2-8a4c-1ce345c33797', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('342f2731-5530-4ee8-a713-c5923b690121', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('2be1e4a1-7cac-4e02-ad00-5f8d2dbe089f', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('846c4a38-9901-4a1d-8dd7-1a2266f7053c', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('63769ad2-f1a1-4620-a990-a9b04effe543', 'd77585f7-80ac-4466-8f7e-df2f56f14961', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('022404e4-e616-449e-8ba4-240b5f318378', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('919c8f2e-cc0a-413b-b37c-b5b0ec6b0fde', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('95c16dff-d9a2-4848-95ba-675c46936574', 'de047af9-899b-46db-8ae2-f46f5a19967b', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('ad47a1d0-35e3-4fab-9c23-a9760e1ed4f8', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('b92dd7a1-7aa1-4c1f-bb55-47a7ca557cba', '223b6fad-06f4-4aac-b203-a6486f05ee0a', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('94103a62-f41d-495c-9a82-82ae134f6bac', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('ea1d4884-407a-4697-9e07-00f85022c684', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('3f18c2fc-c6c8-4ebd-b07d-999a1372eeb6', '89334953-16df-4963-a464-19a4af258542', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('e7770784-9758-4449-a171-b2300d8d0be1', 'd7018362-2172-4735-8ab5-32acef7b824f', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('77ff104e-db2d-4b6a-b0a4-4bc0bc7ce3a5', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('22716ff6-cbd4-49ec-a59b-8cae41b39822', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('74e055a1-490d-4c45-a007-36b7459df8d3', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('e7453e62-799c-4221-9199-7743318a5447', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('33880fce-dd8a-49e1-87c0-9f5466f63fad', '2422b3dc-6627-4f1a-8c23-42683239a614', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('edb54c4d-846b-4436-9648-a38c2bd6b1a8', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('8782d415-b2ad-47c0-9b4f-911a27255d89', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('57f68f00-2413-4ce5-b56c-d7b414694c0b', '81327958-0ca5-47ba-a274-0fd3acfca3e6', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false),
('6ad71d98-159c-4422-b93d-d60dc5938f24', '5338ad66-e1ec-481d-ae32-7b68f6061469', 'Trafego', 'Quer atrair mais clientes e aumentar suas vendas?

Chegou a hora de investir em uma estratégia que gera resultados reais.

Entre em contato com Wagner e descubra como o tráfego pago pode impulsionar o crescimento da sua empresa.

📲 WhatsApp: +55 77 9966-8607', false, '2026-07-14T20:59:55.556206+00:00', 'campanha_promocional', false);

insert into public.referral_codes (id, user_id, code, created_at) values
('4aa28401-6218-4178-9f87-dcd0567dbc1f', '35bac96e-56ce-4545-a463-973cb055e7f6', 'NUFLVUQL', '2026-02-20T16:59:55.235173+00:00'),
('751ecdee-f800-40d0-bdc2-b666f449deef', 'f1ee605f-57dc-4114-816e-166815fa551f', '21HH1JFA', '2026-02-20T17:14:47.518669+00:00'),
('1dfe3c93-f576-4965-be94-160ac9a0b2c8', '402c21f0-71b7-47d8-a14a-f69985a0aec2', '2PUPQE64', '2026-02-20T17:38:47.333151+00:00'),
('3efaa8c4-b3fd-4301-b737-3ea86d56bc49', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', '1BP9MCKA', '2026-02-20T17:49:27.100369+00:00'),
('f4924e05-a75c-448a-84da-04053f9e4ebc', '550215d8-6b1f-4c04-8f50-b7e38def45c2', '1EG5ZZX3', '2026-02-20T17:53:29.894382+00:00'),
('f878269f-8af0-4f2f-a881-cf35eec46f79', 'ba3fc8aa-c1d7-4e31-82de-0420446d6c66', '2LDVG7F5', '2026-02-20T17:58:08.982167+00:00'),
('5fe8cf06-c3a7-4878-9fce-b741bb7ac7d1', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', '20FJO487', '2026-02-20T18:04:06.005886+00:00'),
('55fb83c8-91ce-4545-843d-2bc372a2a9eb', '9225a213-9c51-4f25-a3e8-1c4c1c76f768', '15HSUH4K', '2026-02-24T13:22:55.778844+00:00'),
('073378f5-a927-49fa-a599-86f17f9d5399', '89106ebb-4cb9-4cd4-981b-359df9fd92d7', 'OZA7DRQY', '2026-02-25T11:20:03.513021+00:00'),
('391b3177-78cd-43bf-b46a-289d5d63a5e1', '63c418aa-5005-4487-bbcf-452a57a98724', '1S5IW88O', '2026-02-26T13:47:03.137652+00:00'),
('7d1a7ac4-45f2-4734-bf92-b7ed0f840e68', '223a152a-660e-46c0-993c-5077e7dc1ee7', 'HHLQRPRP', '2026-02-27T14:00:16.58384+00:00'),
('b3c71576-e0ad-40c3-828d-70b18fe2b611', '963a3921-096a-440e-a423-b6f398581b89', '2I5MVWJG', '2026-02-27T18:05:28.303789+00:00'),
('fb2787fc-30f7-4dce-af1d-cf15a06263d4', '373bc3a3-07f4-48b3-80c9-caca530e9e09', '2GU1QI0I', '2026-02-28T19:27:26.02378+00:00'),
('bcc82fdd-cb7c-449d-b587-7c3072f8c6b3', '967c04df-26b2-4b64-9629-696ab31604bc', 'Q12KL915', '2026-03-05T12:04:21.393225+00:00'),
('877cc931-0a4f-4d4c-b860-1c0ebc1d9f6d', 'ef6c8d40-a6c2-4057-8d58-515a02d80274', '2PKMTJBS', '2026-03-11T23:41:29.354335+00:00'),
('d1e38f9d-b449-43d7-9f54-4a76df7e9501', 'e7a0789b-f987-4d56-aac7-391e07392b8b', '237A3G7T', '2026-03-20T19:15:46.510974+00:00'),
('6255ca9f-348b-40d3-8828-64a2a5908560', 'd3969b1b-39c7-4461-8603-93a4d79ec0db', '2J7YLXVL', '2026-03-20T20:38:11.870198+00:00'),
('3c0bd69b-797f-437a-975a-34f82ca374c7', '5916583f-8a87-4124-bd22-a76446cc6667', '10JYNQ03', '2026-03-21T13:57:01.167142+00:00'),
('43367ec4-f19a-4a03-80bd-c5704664c96a', 'ed3faccf-ac4a-4e70-a96f-a9dc3f4eef98', '25TXDDB2', '2026-03-27T11:45:08.694197+00:00'),
('64aa8c50-2984-4887-bb47-ce35cce5da48', '6df07bca-3e03-436b-a121-5aabdb507fa0', 'KODF10GC', '2026-03-27T11:54:34.708651+00:00'),
('8a9de093-82cb-465e-81e0-c4a077559898', 'cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', 'EQE95DQP', '2026-03-27T12:15:12.054763+00:00'),
('bb797d94-d4ca-45ff-8a02-db8bcc4a3bd3', 'dd084b60-f150-49e9-b72b-d00cb9bbc648', 'O4ZNGHQC', '2026-03-30T12:24:45.924733+00:00'),
('77c36d2a-4393-4c3c-816f-a33826b51e58', '90a3185a-e962-4928-991d-8220e5bc27ea', '2GRJU3T8', '2026-03-30T16:08:33.008862+00:00'),
('2f9eb628-6ea7-491b-8971-ca6257fc229a', '403f661c-db70-4a5a-9c00-a966909b707c', 'F6QQQRXE', '2026-03-31T20:28:56.692188+00:00'),
('dbb29bdf-8f44-4e7a-9c2a-829d601db362', '01d882a1-96f8-42a5-868a-64c7e0a042d9', '21B8M0UL', '2026-03-31T20:38:16.102407+00:00'),
('ccd4ed5f-69e7-44c4-898a-8124a24803c7', 'b1c70b99-362b-4541-83eb-4643682d3eee', '2HZHAY7O', '2026-03-31T21:17:11.777158+00:00'),
('f7395267-c10d-4430-8ccc-152a71c02715', '1f33284f-8fff-4467-a35f-afbc8fa64ce5', '2F236U07', '2026-03-31T21:51:29.444974+00:00'),
('9e5a45e4-4f3a-4762-a30e-99567e4d6dd8', '720ad13b-b5b9-41c9-b752-c40c01616ce8', 'IBQ0SY1H', '2026-03-31T22:04:00.916155+00:00'),
('e39b20b8-5fc7-40cf-b708-37543ab9b46e', 'd77585f7-80ac-4466-8f7e-df2f56f14961', '1Q5M8633', '2026-03-31T22:05:26.582793+00:00'),
('f4820f24-85eb-4bc8-a18d-7c7b1c74230b', 'c0e18d89-7f64-4358-8288-2328f33b4ad2', 'DIXLOQVC', '2026-03-31T22:17:28.254208+00:00'),
('0d7cafcb-8498-46b5-8acc-af4eca1ccf4e', '7ece4ee9-29b4-4d61-8d44-662227efcb2c', '5A2Q6Y8U', '2026-03-31T22:37:27.105299+00:00'),
('6625029d-a6d3-4b3c-809a-de6b97c168e5', 'de047af9-899b-46db-8ae2-f46f5a19967b', '1KCD3AWI', '2026-03-31T23:27:40.831706+00:00'),
('ea187e7d-5f36-467e-a0c1-ee18a82876ca', 'db067ea9-172d-4c1e-ae9d-a7491d2114dc', '14DNB1GH', '2026-04-01T00:39:40.075421+00:00'),
('fd8c1dad-ac93-4dc6-a16c-a9ccd7f02a8c', '223b6fad-06f4-4aac-b203-a6486f05ee0a', '1AK2NXQ3', '2026-04-01T19:25:36.179813+00:00'),
('e141e3d8-8fd9-4b84-8ac9-1ee749b20cbe', '2a7b8bf3-dc56-4e67-aea2-9cec00af9515', '1BAQA3UB', '2026-04-01T21:57:14.689959+00:00'),
('d368dd0b-2944-4037-a521-d716988ec149', '860e73de-d17c-4fc4-985e-e2cf3cd0b304', 'FDTFYBRU', '2026-04-02T00:09:35.224227+00:00'),
('8fe2ce4d-9c74-4231-9565-b7cbecc55fe8', '89334953-16df-4963-a464-19a4af258542', '1H438RJ3', '2026-04-02T05:43:31.213456+00:00'),
('c079c99b-b095-47dc-b8a0-e7078daa3baa', 'd7018362-2172-4735-8ab5-32acef7b824f', 'UM9TI0Q5', '2026-04-06T18:53:25.296066+00:00'),
('1a4b6c59-64cb-4a2b-a22b-7c1fc2977ab8', 'cecc3e69-f1eb-446e-942c-9aac616c0bab', '1WB0PZFT', '2026-04-14T12:12:45.447153+00:00'),
('78b465a6-1d31-418b-adba-22a5be92711d', '8e5e7efc-9819-496c-9e71-e733d0d4a08f', '2L90FXMA', '2026-04-21T18:21:46.975311+00:00'),
('b39b3c77-01b0-46eb-82ea-42cd35383d95', '72159686-5b43-4f0f-9470-dc493c8bc9b7', 'I2JIKU6X', '2026-04-23T00:59:14.218447+00:00'),
('070aea46-7efa-43fc-a6f2-35c58b58af05', '3ab60b74-a1a2-4d88-8b45-9fe6acd32389', '1733CJMT', '2026-05-06T03:08:37.210797+00:00'),
('b5d3bce1-d433-48b6-bf26-de0306751251', '2422b3dc-6627-4f1a-8c23-42683239a614', '2PZ6B6U8', '2026-05-09T19:34:52.832765+00:00'),
('672953a8-b3b2-4542-ab0c-59792ca3cfab', '2f049ab3-52bd-4501-8953-92d9c412fe2a', 'U1UWFISW', '2026-05-30T13:45:16.14747+00:00'),
('a85767c6-0e3e-4d74-b0be-c122eaca4e35', 'e757d643-c64b-4be1-b6b2-eaca7d9ab33a', '1EBUB37X', '2026-05-30T13:51:27.641196+00:00'),
('9c01c6bb-200a-4b6f-b0eb-264ac4ee85d9', '81327958-0ca5-47ba-a274-0fd3acfca3e6', '1N9ARPOS', '2026-07-04T14:43:45.417106+00:00'),
('7ec4cde9-870b-43aa-ab0c-247459c050d6', '5338ad66-e1ec-481d-ae32-7b68f6061469', '270HTZBP', '2026-07-14T20:19:49.35142+00:00'),
('b6a069a8-dc3a-45e4-ba2a-3a332cb07a80', '0f97ccd5-ddb0-4af5-a600-1354560220c5', '25YMP3HK', '2026-07-17T13:29:31.195304+00:00');

insert into public.referral_events (id, referrer_id, referred_user_id, email_hash, cpf_hash, points_granted, status, created_at) values
('f5976462-ffde-47db-8090-875700b2e0cf', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', '550215d8-6b1f-4c04-8f50-b7e38def45c2', '5cfbf1bae77651203620c5c8449289e04930972b19e8a5967518a794ecb08113', 'c6f035a0249c477781d4b5fbc8737f665e80c4488b857d73e19b8d94ae02c144', true, 'valid', '2026-02-20T17:53:30.348786+00:00'),
('c3e5bae4-9460-4000-86ee-79438361d9b7', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'ba3fc8aa-c1d7-4e31-82de-0420446d6c66', 'ae9a2060b4d24f6813bd969f169231930438b0007d39434c6f3e92071288453e', '39f4b0769664ab284244ab0950ade8205a62c18927ba9590e6749973efbf7556', true, 'valid', '2026-02-20T17:58:09.403184+00:00'),
('905113f8-1f69-42f5-9680-27347e3f5c72', 'e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', 'dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', 'ae9a2060b4d24f6813bd969f169231930438b0007d39434c6f3e92071288453e', '39f4b0769664ab284244ab0950ade8205a62c18927ba9590e6749973efbf7556', false, 'recorrencia_detectada', '2026-02-20T18:04:06.426109+00:00');

insert into public.referral_welcome_shown (user_id, shown_at) values
('f1ee605f-57dc-4114-816e-166815fa551f', '2026-02-20T17:15:49.834621+00:00'),
('e888f61f-5c39-43f8-97a3-2eb4b5fa55c9', '2026-02-20T17:49:55.117777+00:00'),
('ba3fc8aa-c1d7-4e31-82de-0420446d6c66', '2026-02-20T17:59:28.826905+00:00'),
('dffb0a9e-c5fd-4a55-844d-ac2b2010df6a', '2026-02-20T18:05:58.196607+00:00'),
('9225a213-9c51-4f25-a3e8-1c4c1c76f768', '2026-02-24T13:26:28.055045+00:00'),
('89106ebb-4cb9-4cd4-981b-359df9fd92d7', '2026-02-25T11:20:57.246756+00:00'),
('63c418aa-5005-4487-bbcf-452a57a98724', '2026-02-26T13:47:39.09457+00:00'),
('223a152a-660e-46c0-993c-5077e7dc1ee7', '2026-02-27T14:00:57.510593+00:00'),
('963a3921-096a-440e-a423-b6f398581b89', '2026-02-27T18:06:06.089575+00:00'),
('373bc3a3-07f4-48b3-80c9-caca530e9e09', '2026-02-28T19:27:52.273374+00:00'),
('967c04df-26b2-4b64-9629-696ab31604bc', '2026-03-05T12:04:50.612978+00:00'),
('ef6c8d40-a6c2-4057-8d58-515a02d80274', '2026-03-11T23:42:14.105394+00:00'),
('e7a0789b-f987-4d56-aac7-391e07392b8b', '2026-03-20T19:17:04.971415+00:00'),
('d3969b1b-39c7-4461-8603-93a4d79ec0db', '2026-03-20T21:58:13.368096+00:00'),
('cd9fb48e-f7f6-4569-995c-8c4da0f1ad6f', '2026-03-27T12:16:50.2587+00:00'),
('dd084b60-f150-49e9-b72b-d00cb9bbc648', '2026-03-30T12:40:35.958448+00:00'),
('90a3185a-e962-4928-991d-8220e5bc27ea', '2026-03-30T21:39:56.368907+00:00'),
('01d882a1-96f8-42a5-868a-64c7e0a042d9', '2026-03-31T20:40:25.343671+00:00'),
('720ad13b-b5b9-41c9-b752-c40c01616ce8', '2026-03-31T22:05:14.643366+00:00'),
('c0e18d89-7f64-4358-8288-2328f33b4ad2', '2026-03-31T22:17:52.650734+00:00'),
('7ece4ee9-29b4-4d61-8d44-662227efcb2c', '2026-03-31T22:38:05.539721+00:00'),
('de047af9-899b-46db-8ae2-f46f5a19967b', '2026-03-31T23:43:20.932582+00:00'),
('db067ea9-172d-4c1e-ae9d-a7491d2114dc', '2026-04-01T00:40:43.580611+00:00'),
('223b6fad-06f4-4aac-b203-a6486f05ee0a', '2026-04-01T19:26:21.364435+00:00'),
('89334953-16df-4963-a464-19a4af258542', '2026-04-02T05:44:23.79066+00:00'),
('d7018362-2172-4735-8ab5-32acef7b824f', '2026-04-06T18:54:33.887174+00:00'),
('cecc3e69-f1eb-446e-942c-9aac616c0bab', '2026-04-14T12:35:17.723498+00:00'),
('72159686-5b43-4f0f-9470-dc493c8bc9b7', '2026-04-23T00:59:35.608921+00:00'),
('3ab60b74-a1a2-4d88-8b45-9fe6acd32389', '2026-05-06T03:09:35.98032+00:00'),
('2422b3dc-6627-4f1a-8c23-42683239a614', '2026-05-09T19:37:24.944516+00:00'),
('81327958-0ca5-47ba-a274-0fd3acfca3e6', '2026-07-04T14:44:37.475918+00:00'),
('5338ad66-e1ec-481d-ae32-7b68f6061469', '2026-07-14T20:20:45.127411+00:00'),
('0f97ccd5-ddb0-4af5-a600-1354560220c5', '2026-07-17T13:30:01.649248+00:00');

insert into public.admin_audit_logs (id, admin_id, action, target_table, target_id, details, created_at) values
('009d2b17-a0f7-4c9f-8df1-ccd157b91da9', '6468862c-9222-405d-a003-c6bf573571ff', 'promote_to_admin', 'user_roles', '915bc401-8592-4f0a-a6ac-a2df3d09d86c', '{"timestamp": "2026-01-26T11:45:15.951845+00:00", "promoted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-01-26T11:45:15.951845+00:00'),
('52503956-7ddd-4535-8127-3500e26b48b4', '6468862c-9222-405d-a003-c6bf573571ff', 'demote_to_user', 'user_roles', '915bc401-8592-4f0a-a6ac-a2df3d09d86c', '{"timestamp": "2026-01-26T17:33:14.966146+00:00", "demoted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-01-26T17:33:14.966146+00:00'),
('d70bb281-87b3-4df9-9574-473317a04f2a', '6468862c-9222-405d-a003-c6bf573571ff', 'receipt_update', 'receipts', '3cb0fbfd-89b7-4879-95e3-82a0fce52a09', '{"changes": [{"field": "Valor da compra", "newValue": "189", "oldValue": "200"}, {"field": "Pontos gerados", "newValue": "190", "oldValue": "200"}], "admin_id": "6468862c-9222-405d-a003-c6bf573571ff", "changed_at": "2026-01-27T17:33:41.519Z"}'::jsonb, '2026-01-27T17:33:42.014518+00:00'),
('148d698a-73ea-4c39-84db-330d0684b5f1', '6468862c-9222-405d-a003-c6bf573571ff', 'receipt_update', 'receipts', 'd7a376a3-788e-4d89-b084-b8f21ca44e61', '{"changes": [{"field": "Valor da compra", "newValue": "70", "oldValue": "200"}, {"field": "Pontos gerados", "newValue": "70", "oldValue": "200"}], "admin_id": "6468862c-9222-405d-a003-c6bf573571ff", "changed_at": "2026-01-27T17:44:22.218Z"}'::jsonb, '2026-01-27T17:44:22.614671+00:00'),
('8cbf9fdc-c0b5-436c-961b-d7863b1bfc56', '6468862c-9222-405d-a003-c6bf573571ff', 'promote_to_admin', 'user_roles', '0a0951f0-c8dc-476c-889b-f7c67092208d', '{"timestamp": "2026-01-27T21:46:51.446255+00:00", "promoted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-01-27T21:46:51.446255+00:00'),
('86fea858-a721-418c-b878-d19966a6fe36', '6468862c-9222-405d-a003-c6bf573571ff', 'update_redemption_status', 'redemptions', 'cbf74bc4-a064-42df-8d45-940c34006b01', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-01-28T18:32:51.636751+00:00'),
('57387713-52c6-4cf1-aaa4-9288e0fe1065', '6468862c-9222-405d-a003-c6bf573571ff', 'update_redemption_status', 'redemptions', '32a0efa7-ecd7-4cf8-9c2d-ba551cda1cff', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-01-30T22:45:11.002077+00:00'),
('87bffc53-740f-42e2-9057-70edc0d7f76a', '6468862c-9222-405d-a003-c6bf573571ff', 'update_redemption_status', 'redemptions', 'c6644d61-1b26-42da-9599-7bb281f60df8', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-01-30T22:45:12.737032+00:00'),
('cc6cc713-ab82-4b63-851f-0571cf6cf042', '6468862c-9222-405d-a003-c6bf573571ff', 'update_redemption_status', 'redemptions', '77893555-1835-42ba-9f5d-38cffde8c98a', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-01-30T23:00:17.818455+00:00'),
('ad8be9f2-66e2-4226-b133-4b73146d593f', '6468862c-9222-405d-a003-c6bf573571ff', 'promote_to_admin', 'user_roles', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', '{"timestamp": "2026-02-03T11:16:25.241183+00:00", "promoted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-03T11:16:25.241183+00:00'),
('8d66e31f-7777-4dd5-95d5-e6e166a32f2b', '6468862c-9222-405d-a003-c6bf573571ff', 'demote_to_user', 'user_roles', '0a0951f0-c8dc-476c-889b-f7c67092208d', '{"timestamp": "2026-02-03T11:16:38.521753+00:00", "demoted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-03T11:16:38.521753+00:00'),
('70ffbe2b-52cb-4011-958a-a992a0a666ce', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', 'c33ae4d8-82ac-4623-aba2-4806ab9676eb', '{"timestamp": "2026-02-04T11:58:36.003Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-04T11:58:36.105009+00:00'),
('ffb5b538-c097-47c4-bd9e-5e80a30cc221', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', 'c33ae4d8-82ac-4623-aba2-4806ab9676eb', '{"timestamp": "2026-02-04T11:58:47.333Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-04T11:58:47.430235+00:00'),
('d9eee37e-1f1f-48b4-a71c-ed338070d7c0', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '53ed959b-f00b-490d-a106-ffb094570406', '{"timestamp": "2026-02-04T12:04:46.703Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-04T12:04:46.807986+00:00'),
('7f8ebb2c-3445-4818-8011-3c4569e456c2', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '872f1acf-149b-47fb-8e02-5e190c3f7dd0', '{"timestamp": "2026-02-05T14:16:32.025Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-05T14:16:32.122698+00:00'),
('bbb1d964-b4cc-4fb9-99ae-0075ea6cd6ae', '6468862c-9222-405d-a003-c6bf573571ff', 'receipt_update', 'receipts', 'e4af9678-c3bf-4691-9413-d70d6ffe4daa', '{"changes": [{"field": "Valor da compra", "newValue": "500", "oldValue": "5000"}, {"field": "Pontos gerados", "newValue": "5000", "oldValue": "50000"}], "admin_id": "6468862c-9222-405d-a003-c6bf573571ff", "changed_at": "2026-02-05T14:56:32.518Z"}'::jsonb, '2026-02-05T14:56:33.006873+00:00'),
('e9964292-78f9-4984-a9aa-66681fd724c1', '6468862c-9222-405d-a003-c6bf573571ff', 'receipt_update', 'receipts', 'aceecab3-acc9-4ec5-af01-a1b25138e0e2', '{"changes": [{"field": "Valor da compra", "newValue": "100", "oldValue": "1000"}, {"field": "Pontos gerados", "newValue": "1000", "oldValue": "10000"}], "admin_id": "6468862c-9222-405d-a003-c6bf573571ff", "changed_at": "2026-02-05T15:00:34.646Z"}'::jsonb, '2026-02-05T15:00:35.152504+00:00'),
('32abd782-a94c-47b1-9d7c-9fa9a509e019', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'receipt_update', 'receipts', '5b2c6891-abca-4313-89ee-c89187a35126', '{"changes": [{"field": "Valor da compra", "newValue": "190000", "oldValue": "1900000"}, {"field": "Pontos gerados", "newValue": "1900000", "oldValue": "19000000"}], "admin_id": "35315e6d-62cc-464c-8299-4f3cd2c32ac9", "changed_at": "2026-02-05T18:41:09.643Z"}'::jsonb, '2026-02-05T18:41:10.033941+00:00'),
('d02bbe3f-7254-4704-932c-43bb548cc39d', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'receipt_update', 'receipts', '5b2c6891-abca-4313-89ee-c89187a35126', '{"changes": [{"field": "Valor da compra", "newValue": "1900000", "oldValue": "190000"}, {"field": "Pontos gerados", "newValue": "19000000", "oldValue": "1900000"}], "admin_id": "35315e6d-62cc-464c-8299-4f3cd2c32ac9", "changed_at": "2026-02-05T18:41:22.817Z"}'::jsonb, '2026-02-05T18:41:23.125185+00:00'),
('2acd3a39-b5ac-467b-8afd-538766aa1159', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'receipt_update', 'receipts', 'a87753f8-b24a-4857-8d9c-e2ca2a60ac97', '{"changes": [{"field": "Valor da compra", "newValue": "1111", "oldValue": "10"}, {"field": "Pontos gerados", "newValue": "11110", "oldValue": "100"}], "admin_id": "35315e6d-62cc-464c-8299-4f3cd2c32ac9", "changed_at": "2026-02-05T18:47:35.884Z"}'::jsonb, '2026-02-05T18:47:36.335831+00:00'),
('296eb025-7152-440b-a13e-eb46fe7ac950', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '9602b08c-39d6-47e2-be05-ebe203cf4ef6', '{"timestamp": "2026-02-16T13:27:01.691Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T13:27:01.799253+00:00'),
('b3a3aa03-36cd-44ed-bad3-5c63f73cc36a', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '3a21e21a-73fe-4744-bf13-ce633c16dfd3', '{"timestamp": "2026-02-16T13:27:09.948Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T13:27:10.036734+00:00'),
('8a97c934-5cae-41c3-8c7b-dba15dab9c55', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '2196d85d-1284-47cb-96e5-3eef2a205a56', '{"timestamp": "2026-02-16T13:27:14.902Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T13:27:14.997109+00:00'),
('55d4569c-2726-49f8-9036-47c87f26aec7', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', 'ef6e5768-ed68-4260-b4f7-64a97055bb85', '{"timestamp": "2026-02-16T13:31:20.857Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T13:31:20.951993+00:00'),
('901ba4a6-85a5-437d-a08c-941414878f3b', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', 'fc71ab9a-73c1-4772-8857-ac752da83421', '{"timestamp": "2026-02-16T13:34:57.191Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T13:34:57.282506+00:00'),
('136e631d-5d17-4446-a440-b042468c3064', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', 'f8d78c35-e064-4668-9043-1782d224f6fd', '{"timestamp": "2026-02-16T15:19:44.657Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-16T15:19:44.755827+00:00'),
('91b95e78-17c0-437e-ba8d-96accaf5eebd', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', 'cc8c19b9-1243-4082-85b7-f5534c165be8', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T19:03:24.264745+00:00'),
('8ba40d7d-121a-4f60-b13c-f67c10e3da2b', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '0e144ff4-b4ec-4ef0-b28f-27e0c0e4871f', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T19:53:02.612761+00:00'),
('459d5516-60ff-42ff-b5b0-82140dc7cfe2', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '20a42b06-76f2-43e3-b2fe-0eccd1306a67', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T19:55:05.383878+00:00'),
('aefa5703-155f-424d-9139-31066abbf60a', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '6ed54e61-ba42-4060-911b-aef47d3e84a5', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T20:10:10.186322+00:00'),
('a448585a-0e0b-45e9-befc-d9b70de3f542', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', 'f7cc7fd6-e171-4bc8-bf2b-077654c796cb', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T20:10:11.632794+00:00'),
('68617157-fdf4-427b-81d5-f0c961a8e34b', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '42b4f61f-d7c5-4a38-8b34-61b64e2b64ac', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T20:10:12.792848+00:00'),
('e387925d-c413-4b08-a724-0b6982b92d41', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', 'bbd2ce06-a3d2-40f5-87fb-63e5a18cf241', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-16T20:10:14.571993+00:00'),
('7c1bc3bb-c85c-447c-8047-f2a23ada465c', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '35bac96e-56ce-4545-a463-973cb055e7f6', '{"timestamp": "2026-02-20T17:36:28.850Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-20T17:36:28.943776+00:00'),
('a253006b-88fc-4890-b761-fb199b1f6b44', '6468862c-9222-405d-a003-c6bf573571ff', 'delete_user', 'profiles', '402c21f0-71b7-47d8-a14a-f69985a0aec2', '{"timestamp": "2026-02-20T17:42:16.640Z", "deleted_by": "6468862c-9222-405d-a003-c6bf573571ff"}'::jsonb, '2026-02-20T17:42:16.733573+00:00'),
('23e204fc-bf62-4c71-9e4b-f60a54630232', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', 'b966fe71-8e28-430a-bacb-7fc9046258bf', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-02-27T18:38:24.64658+00:00'),
('4e50aa9f-5fa6-4f98-9c78-9811d00b0a9a', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'delete_user', 'profiles', '963a3921-096a-440e-a423-b6f398581b89', '{"timestamp": "2026-02-27T18:42:45.821Z", "deleted_by": "35315e6d-62cc-464c-8299-4f3cd2c32ac9"}'::jsonb, '2026-02-27T18:42:45.92329+00:00'),
('60de9778-1238-4a96-920e-ab2cc14ed295', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'delete_user', 'profiles', '5916583f-8a87-4124-bd22-a76446cc6667', '{"timestamp": "2026-03-21T13:58:10.195Z", "deleted_by": "35315e6d-62cc-464c-8299-4f3cd2c32ac9"}'::jsonb, '2026-03-21T13:58:10.29311+00:00'),
('20c76242-2f63-4660-a850-e8778e6cece5', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'delete_user', 'profiles', 'ed3faccf-ac4a-4e70-a96f-a9dc3f4eef98', '{"timestamp": "2026-03-27T11:51:31.505Z", "deleted_by": "35315e6d-62cc-464c-8299-4f3cd2c32ac9"}'::jsonb, '2026-03-27T11:51:31.598073+00:00'),
('a92b27d9-fe88-4c70-b19f-9dcbf640104d', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '2208b8ee-bad7-468b-8df3-7eee8ddf1b81', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-03-27T12:07:02.439128+00:00'),
('fb7af5f6-d768-4b42-99f8-ff7558e3538f', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'delete_user', 'profiles', '6df07bca-3e03-436b-a121-5aabdb507fa0', '{"timestamp": "2026-03-30T12:33:10.709Z", "deleted_by": "35315e6d-62cc-464c-8299-4f3cd2c32ac9"}'::jsonb, '2026-03-30T12:33:10.810735+00:00'),
('a56fc128-e0da-4854-b69a-fa48b3433724', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '1711e213-1ca1-48f9-8a1f-3d58fd9bc58e', '{"db_status": "cancelled", "new_status": "cancelado"}'::jsonb, '2026-07-04T14:56:24.847308+00:00'),
('71c10788-522a-4464-af57-268f589abfdf', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', '18256932-95bf-4af6-8bfe-4991f782ab0c', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-07-04T14:56:39.973984+00:00'),
('41e67cb3-3002-42e8-ae92-718b0ba05385', '35315e6d-62cc-464c-8299-4f3cd2c32ac9', 'update_redemption_status', 'redemptions', 'd3ca8401-aa09-4d1b-8293-78c22c484527', '{"db_status": "completed", "new_status": "concluido"}'::jsonb, '2026-07-14T20:56:29.483506+00:00');

-- ajusta a sequencia de protocolo para evitar colisao com recibos antigos
select setval('public.receipts_protocol_seq', 100000, true);

-- religa gatilhos
alter table public.receipts enable trigger user;
alter table public.redemptions enable trigger user;
alter table public.notifications enable trigger user;
alter table public.points_ledger enable trigger user;
alter table public.user_roles enable trigger user;
alter table public.profiles enable trigger user;
