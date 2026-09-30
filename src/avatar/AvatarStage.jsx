/**
 * الأفاتار الحيّ — نفس النموذج ونفس مشغّل الإشارات في تطبيق ترجمان.
 *
 * يُحمَّل كسولاً (React.lazy)، فلا يدفع الزائر ثمن three.js قبل ظهور النصّ.
 *
 * ولا يُرسم إلّا حين يتحرّك. كان المشهد يُعاد رسمه ستّين مرّة في الثانية
 * بدقّةٍ مضاعفة والأفاتار واقفٌ لا يتحرّك — وهذا وحده يكفي ليثقل الصفحة
 * كلّها. الآن الرسم «عند الطلب»: إطارٌ عند التحميل وتغيّر المقاس، وإطاراتٌ
 * متتابعة فقط ما دامت إشارةٌ تُؤدّى.
 */
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useSignPlayer } from './useSignPlayer';

const MODEL_URL = `${import.meta.env.BASE_URL}last_cartoon_face11.glb`;

// نفس القيمة الموجودة في useSignPlayer — الفاصل بين إشارتين
const INTER_SIGN_GAP = 0.18;

// بعد نهاية الإشارة: فترة الفاصل + عودة الذراع إلى السكون
const SETTLE_S = 0.9;

// ──────────────────── ثوابت الفك ────────────────────
// أقصى زاوية فتح الفم (درجات)
const JAW_OPEN_RAD = (9 * Math.PI) / 180;
const JAW_AXIS     = new THREE.Vector3(1, 0, 0);

// ──────────────────── ثوابت العيون ────────────────────
// زاوية إغلاق الجفن العلوي (درجات — محور X المحلّي للجفن)
const LID_CLOSE_RAD  = (38 * Math.PI) / 180;
const LID_AXIS       = new THREE.Vector3(1, 0, 0);
// مدة الرمشة (ms)
const BLINK_DUR_MS   = 140;
// حد أدنى وأقصى للفترة بين رمشتين (ms)
const BLINK_MIN_MS   = 2500;
const BLINK_MAX_MS   = 5500;

// ──────────────────── ثوابت الحاجبين ────────────────────
// رفع خفيف للحاجب أثناء الكلام
const BROW_TALK_RAD = (4 * Math.PI) / 180;
const BROW_AXIS     = new THREE.Vector3(0, 0, 1);

// Quaternions مُعادة الاستخدام (global = لا garbage كل إطار)
const _jawTarget  = new THREE.Quaternion();
const _jawOpenDelta = new THREE.Quaternion().setFromAxisAngle(JAW_AXIS, JAW_OPEN_RAD);
const _lidClose   = new THREE.Quaternion().setFromAxisAngle(LID_AXIS, LID_CLOSE_RAD);
const _browTalk   = new THREE.Quaternion().setFromAxisAngle(BROW_AXIS, BROW_TALK_RAD);

// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ playerRef }) {
  const { scene }   = useGLTF(MODEL_URL);
  const invalidate  = useThree((s) => s.invalidate);
  const player      = useSignPlayer({ scene, actions: null });
  const busyUntil   = useRef(0);

  // ── عظام الفك ──
  const jawBone  = useRef(null);
  const jawRestQ = useRef(new THREE.Quaternion());
  const jawOpenQ = useRef(new THREE.Quaternion());

  // ── جدول توقيت الكلمات: [{start, end}] بالـ ms ──
  // كل مدخلة = متى يبدأ صوت هذه الكلمة ومتى ينتهي
  const jawSchedule = useRef([]);

  // ── عظام الجفن العلوي ──
  const lidUpL   = useRef(null);
  const lidUpR   = useRef(null);
  const lidRestL = useRef(new THREE.Quaternion());
  const lidRestR = useRef(new THREE.Quaternion());
  const lidShutL = useRef(new THREE.Quaternion()); // مغلق
  const lidShutR = useRef(new THREE.Quaternion());

  // ── حالة الرمش ──
  const blinkStartAt = useRef(0);  // 0 = لا رمشة الآن
  const nextBlinkAt  = useRef(performance.now() + 2000);

  // ── عظام الحاجبين ──
  const browL    = useRef(null);
  const browR    = useRef(null);
  const browRestL = useRef(new THREE.Quaternion());
  const browRestR = useRef(new THREE.Quaternion());
  const browTalkL = useRef(new THREE.Quaternion());
  const browTalkR = useRef(new THREE.Quaternion());

  // ── جمع العظام من النموذج ──
  useEffect(() => {
    scene.traverse((o) => {
      if (o.name === 'Face') { o.visible = false; return; }
      if (!o.isBone) return;

      const n = o.name.toLowerCase();

      if (n === 'jaw') {
        jawBone.current = o;
        jawRestQ.current.copy(o.quaternion);
        jawOpenQ.current.copy(jawRestQ.current).multiply(_jawOpenDelta);
      }

      if (n === 'lid_up.l' || n === 'lidupl') {
        lidUpL.current  = o;
        lidRestL.current.copy(o.quaternion);
        // مغلق = راحة × دوران للأسفل
        lidShutL.current.copy(lidRestL.current).multiply(_lidClose);
      }
      if (n === 'lid_up.r' || n === 'lidupr') {
        lidUpR.current  = o;
        lidRestR.current.copy(o.quaternion);
        lidShutR.current.copy(lidRestR.current).multiply(_lidClose);
      }

      if (n === 'brow.l' || n === 'browl') {
        browL.current = o;
        browRestL.current.copy(o.quaternion);
        browTalkL.current.copy(browRestL.current).multiply(_browTalk);
      }
      if (n === 'brow.r' || n === 'browr') {
        browR.current = o;
        browRestR.current.copy(o.quaternion);
        browTalkR.current.copy(browRestR.current).multiply(_browTalk);
      }
    });
    invalidate();
  }, [scene, invalidate]);

  // ── API خارجي ──
  useEffect(() => {
    playerRef.current = {
      play(entries) {
        player.stop();
        player.playSigns(entries);

        const now = performance.now();
        let cursor = now; // نقطة البداية

        // نبني جدول توقيت كل كلمة بدقة
        // useSignPlayer يبدأ كل إشارة بعد INTER_SIGN_GAP ثم يشغّل مدتها
        const schedule = [];
        for (const entry of entries) {
          if (!entry.sign) continue;
          const durMs  = (entry.sign.duration || 0.5) * 1000;
          const gapMs  = INTER_SIGN_GAP * 1000;
          const wordStart = cursor + gapMs;       // بعد الفاصل
          const wordEnd   = wordStart + durMs;    // نهاية الكلمة
          schedule.push({ start: wordStart, end: wordEnd });
          cursor = wordEnd;
        }
        jawSchedule.current = schedule;

        const total = entries.reduce((t, e) => t + (e.sign?.duration || 0), 0);
        busyUntil.current = now + (total + SETTLE_S) * 1000;
        invalidate();
      },
    };
  }, [playerRef, player, invalidate]);

  // ── useFrame: يُشغَّل كل إطار مرسوم ──
  useFrame((_, delta) => {
    player.update(Math.min(delta, 0.05));

    const now        = performance.now();
    const anyPlaying = now < busyUntil.current;

    // هل الكلمة الحالية نشطة؟ (نبحث في الجدول)
    const wordActive = jawSchedule.current.some(
      (w) => now >= w.start && now <= w.end
    );

    // ── الفك: يتحرك فقط خلال نافذة الكلمة ──
    if (jawBone.current) {
      if (wordActive) {
        // موجة جيبية ~400ms → فتح وإغلاق إيقاعي
        const wave = Math.sin(now * 0.0157) * 0.5 + 0.5; // [0..1]
        _jawTarget.slerpQuaternions(jawRestQ.current, jawOpenQ.current, wave);
        jawBone.current.quaternion.slerp(_jawTarget, 0.25);
        invalidate();
      } else {
        // خارج الكلمة: أغلق الفم تدريجياً
        const dist = jawBone.current.quaternion.angleTo(jawRestQ.current);
        if (dist > 0.0005) {
          jawBone.current.quaternion.slerp(jawRestQ.current, 0.15);
          invalidate();
        }
      }
    }

    // ── الحاجبان: يرتفعان خلال الكلمة ثم يعودان ──
    if (browL.current && browR.current) {
      const browTarget = wordActive ? 1 : 0;
      const browSpeed  = 0.08;
      browL.current.quaternion.slerp(
        browTarget > 0.5 ? browTalkL.current : browRestL.current, browSpeed
      );
      browR.current.quaternion.slerp(
        browTarget > 0.5 ? browTalkR.current : browRestR.current, browSpeed
      );
      if (anyPlaying) invalidate();
    }

    // ── الرمش: مستقل عن الكلام ──
    if (lidUpL.current && lidUpR.current) {
      const blinking = blinkStartAt.current > 0;

      if (blinking) {
        const elapsed = now - blinkStartAt.current;
        // نصف الأول: إغلاق — نصف الثاني: فتح
        const half    = BLINK_DUR_MS / 2;
        const t       = elapsed < half
          ? elapsed / half            // 0→1 إغلاق
          : 1 - (elapsed - half) / half; // 1→0 فتح
        const weight  = Math.max(0, Math.min(1, t));

        lidUpL.current.quaternion.slerpQuaternions(lidRestL.current, lidShutL.current, weight);
        lidUpR.current.quaternion.slerpQuaternions(lidRestR.current, lidShutR.current, weight);

        if (elapsed >= BLINK_DUR_MS) {
          // انتهت الرمشة — استعد للتالية
          blinkStartAt.current = 0;
          nextBlinkAt.current  = now + BLINK_MIN_MS
            + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
          lidUpL.current.quaternion.copy(lidRestL.current);
          lidUpR.current.quaternion.copy(lidRestR.current);
        }
        invalidate();
      } else if (now >= nextBlinkAt.current) {
        // حان وقت رمشة جديدة
        blinkStartAt.current = now;
        invalidate();
      }
    }

    if (import.meta.env.DEV) window.__avatarFrames = (window.__avatarFrames || 0) + 1;
  });

  return (
    <group position={[0, -0.82, 0]} scale={1.85}>
      <primitive object={scene} />
    </group>
  );
}

function Framing() {
  const camera     = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { camera.lookAt(0, 0.6, 0); invalidate(); }, [camera, invalidate]);
  return null;
}

export default function AvatarStage({ playerRef }) {
  return (
    <Canvas
      resize={{ offsetSize: true }}
      frameloop="demand"
      camera={{ position: [0, 0.6, 2.05], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <Framing />
      <ambientLight intensity={1.0} />
      <directionalLight position={[0, 4, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, 2]} intensity={0.6} />
      <directionalLight position={[4, 2, 2]} intensity={0.6} />
      <pointLight position={[0, 1.2, 1.8]} intensity={0.35} color="#FFF5E6" />
      <Suspense fallback={null}>
        <Avatar playerRef={playerRef} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
