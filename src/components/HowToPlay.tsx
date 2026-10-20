import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { COARSE, PolishToggle } from './menuParts.tsx';

/**
 * How to play: controls, what the stage is asking for, saving, the menu and the Polished visuals switch.
 *
 * It owns nothing but its own tab, so any screen can mount it (the title, the start menu, the pause menu) and
 * simply unmount it again on close. `intro` is the short first-time version a brand-new player sees before the
 * very first stage: the controls and one big "Let's go" button, with a way to open the whole guide.
 */
interface Props {
  onClose: () => void;
  /** the first-time pop-up: controls only, and the button says "Let's go" */
  intro?: boolean;
}

type Tab = 'controls' | 'goal' | 'saving' | 'visuals';

const TABS: { id: Tab; label: string }[] = [
  { id: 'controls', label: 'Controls' },
  { id: 'goal', label: 'The goal' },
  { id: 'saving', label: 'Saving' },
  { id: 'visuals', label: 'Visuals' },
];

const K: React.FC<{ children: React.ReactNode }> = ({ children }) => <kbd className="htp-key">{children}</kbd>;

/** one line of a controls list: how you do it, what it does */
const Row: React.FC<{ how: React.ReactNode; what: string; sub?: string }> = ({ how, what, sub }) => (
  <div className="htp-row">
    <span className="htp-how">{how}</span>
    <span className="htp-what">
      <b>{what}</b>
      {sub && <small>{sub}</small>}
    </span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="htp-sec">
    <h3 className="ui-label">{title}</h3>
    {children}
  </section>
);

const Controls: React.FC<{ short: boolean }> = ({ short }) => (
  <>
    {(!short || COARSE) && (
    <Section title="On a phone or tablet">
      <p className="ui-copy">
        There are no buttons. <b>The whole screen is the controller</b>, and both thumbs work at the same time: run with one, jump or punch with the other.
      </p>
      <Row how="Slide ← →" what="Run" sub="a slow slide steers from anywhere on the screen" />
      <Row how="Flick ↑" what="Jump" sub="jump again in the air for a double jump" />
      <Row how="Slide ↓" what="Duck" sub="hold it to stay low" />
      <Row how="Tap" what="Punch" />
      <Row how="Quick flick ← →" what="Kick" sub="the way you flick is the way he kicks" />
      <Row how="Press and hold" what="Mega punch" sub="slower, but it hits hard" />
    </Section>
    )}
    {(!short || !COARSE) && (
    <Section title="With a keyboard">
      <Row how={<><K>A</K> <K>D</K> or <K>←</K> <K>→</K></>} what="Run" />
      <Row how={<><K>W</K> <K>↑</K> or <K>Space</K></>} what="Jump" sub="press again in the air for a double jump" />
      <Row how={<><K>S</K> or <K>↓</K></>} what="Duck" />
      <Row how={<><K>J</K> or <K>Z</K></>} what="Punch" />
      <Row how={<><K>K</K> or <K>X</K></>} what="Kick" />
      <Row how={<><K>L</K> or <K>Shift</K></>} what="Mega punch" />
      {!short && (
        <>
          <Row how={<><K>Esc</K> or <K>P</K></>} what="Menu" sub="pauses the game" />
          <Row how={<K>M</K>} what="Mute" />
          <Row how={<K>R</K>} what="Restart the stage" sub="from the Menu" />
        </>
      )}
    </Section>
    )}
    {!short && (
      <Section title="Good to know">
        <p className="ui-copy">
          A game controller works too. <b>Tree trunks can be climbed</b>: jump into one and hold up. Once you clear stage 1-3 you learn the <b>Shimmy Rope</b>: jump up into a rope to grab it, run
          along it with ← →, and press down and jump to let go.
        </p>
      </Section>
    )}
  </>
);

const Goal: React.FC = () => (
  <>
    <Section title="Each stage">
      <p className="ui-copy">
        Every stage ends at a <b>sacred exit shrine</b>, and the card at the top right shows the stage name and how far along you are. Some stages first ask for something: fruit to gather, foes to beat,
        friends to rescue from cages, or hidden <b>Jungle Idols</b> to find. Finish the job, then touch the shrine. The last stage of every world is a <b>boss fight</b> with a health bar of its own.
      </p>
    </Section>
    <Section title="Top of the screen">
      <Row how="❤️❤️❤️" what="Hearts" sub="your health. A heart pick-up refills one" />
      <Row how="× 3" what="Lives" sub="lose every heart and a life goes. With none left the stage is over, and you can try it again" />
      <Row how="★" what="Score" sub="fruit, flowers, leaves and every foe you beat add to it" />
    </Section>
    <Section title="Stars for a stage">
      <Row how="★" what="One star" sub="for clearing the stage" />
      <Row how="★★" what="Two stars" sub="clear it with at least half your hearts left, or beat the target time" />
      <Row how="★★★" what="Three stars" sub="lose no life, keep most of your hearts, and be quick (or collect nearly everything)" />
    </Section>
    <Section title="Pick-ups on the way">
      <Row how="⚡" what="Speed" sub="run faster for a while" />
      <Row how="🛡️" what="Invincible" sub="enemies cannot hurt you for a while" />
      <Row how="🧲" what="Magnet" sub="pulls nearby fruit, flowers and hearts to you" />
      <Row how="🔓" what="Cages" sub="punch a cage to set the friend inside free" />
    </Section>
    <Section title="Where to go next">
      <p className="ui-copy">
        The <b>World Map</b> lets you pick any world you have reached. <b>Trophies</b> shows your badges, and <b>Jungle Cards</b> fills in as you meet each creature.
      </p>
    </Section>
  </>
);

const Saving: React.FC = () => (
  <>
    <Section title="Your progress saves itself">
      <p className="ui-copy">
        Every cleared stage, star and trophy is saved <b>on this device, in this browser</b> as you play. Close the game and come back and <b>Continue</b> takes you right to where you were.
      </p>
    </Section>
    <Section title="Keep a backup">
      <p className="ui-copy">
        Clearing the browser's site data, or switching phones, loses a save. On the title screen, <b>Save / Load</b> can write your whole game to a <b>file</b> or a <b>save code</b> you can paste
        into a note. To bring it back, open <b>Save / Load</b> on the new device, pick <b>Load</b>, and choose the file or paste the code.
      </p>
      <p className="ui-copy ui-warn">New Game erases your progress. It offers a backup first, so use it.</p>
    </Section>
    <Section title="The Menu">
      <p className="ui-copy">
        <b>Menu</b> sits at the top of the title screen, and in a stage it pauses the game ({COARSE ? 'tap Menu at the top' : <>or press <K>Esc</K></>}). It has <b>Resume</b>, <b>Restart</b> for the stage,
        <b> Trophies</b>, <b>Jungle Cards</b> and the <b>World Map</b>, your learned skills, and the Music and Effects volume. You can also open this guide from there.
      </p>
    </Section>
  </>
);

const Visuals: React.FC = () => (
  <>
    <Section title="Polished visuals">
      <p className="ui-copy">
        An extra layer of finish: <b>trees and grass sway in the wind</b>, Slomatt gets a <b>rim of sunlight and a soft shadow</b>, light shafts and drifting pollen move through the jungle, and the
        ground gets roots, dappled light and richer soil.
      </p>
      <p className="ui-copy">
        It is <b>off by default</b>, because it asks a lot of an older phone. If the game ever feels slow, switch it off. It also steps itself down on its own when the game starts to struggle.
      </p>
    </Section>
    <PolishToggle />
  </>
);

export const HowToPlay: React.FC<Props> = ({ onClose, intro = false }) => {
  const [tab, setTab] = React.useState<Tab>('controls');
  const [short, setShort] = React.useState(intro);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="ui-scrim select-none" role="dialog" aria-modal="true" aria-label="How to play" onClick={onClose}>
      <div className="ui-panel htp" onClick={(e) => e.stopPropagation()}>
        <div className="ui-panel-head">
          <div className="flex items-center gap-3">
            <span className="htp-face">
              <HeroFaceIcon size={44} face="face_happy" />
            </span>
            <div>
              <div className="ui-kicker">{short ? 'Before you start' : 'Slomatt says'}</div>
              <h2 className="ui-h2">How to Play</h2>
            </div>
          </div>
          <button type="button" className="ui-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {!short && (
          <div className="ui-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="ui-body htp-body">
          {tab === 'controls' && <Controls short={short} />}
          {!short && tab === 'goal' && <Goal />}
          {!short && tab === 'saving' && <Saving />}
          {!short && tab === 'visuals' && <Visuals />}
        </div>

        <div className="ui-row htp-foot">
          <button type="button" className="ui-btn ui-btn-gold" onClick={onClose} data-start="true">
            {intro ? "Let's go!" : 'Got it'}
          </button>
          {short && (
            <button type="button" className="ui-btn ui-btn-plain" onClick={() => setShort(false)}>
              The full guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/** the first-time pop-up is shown once per device */
const SEEN_KEY = 'sloth_howto_seen';
export function howToSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked: never nag
  }
}
export function markHowToSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}
