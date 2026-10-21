import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { COARSE, PolishToggle } from './menuParts.tsx';
import { GestureGlyph, type GlyphKind } from './GestureGlyph.tsx';
import { Icon } from './icons/index.tsx';

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

/** an arrow in the game's own icon style: l, r, u or d */
const Arr: React.FC<{ d: 'l' | 'r' | 'u' | 'd'; size?: number }> = ({ d, size = 13 }) => <Icon name="arrow" size={size} rotate={{ r: 0, d: 90, l: 180, u: 270 }[d]} />;
/** a row of the same icon: hearts, stars */
const Many: React.FC<{ name: 'heart' | 'star'; n: number }> = ({ name, n }) => (
  <span className="htp-many">
    {Array.from({ length: n }, (_, i) => (
      <Icon key={i} name={name} size={20} />
    ))}
  </span>
);

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

/** a touch gesture: its picture, how you do it, what it does */
const Gesture: React.FC<{ kind: GlyphKind; how: React.ReactNode; what: string; sub?: string }> = ({ kind, how, what, sub }) => (
  <div className="htp-g">
    <GestureGlyph kind={kind} size={76} />
    <span className="htp-what">
      <span className="htp-how">{how}</span>
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
      <div className="htp-tip htp-first">
        <span className="htp-tipicon" aria-hidden="true">
          <GestureGlyph kind="tap" size={44} bare />
        </span>
        <span>
          <b>Touch anywhere on the screen to move.</b> You do not have to touch Pokey, and there is nothing to aim at. Put your thumb down <b>anywhere</b> and slide.
        </span>
      </div>
      <p className="ui-copy">
        There are no buttons: <b>your thumb is the controller</b>. It does not matter where you start, and you never have to find a button. Keep your thumb down to keep going, and lift it to stop. Do not like the tap in the air? The Menu has a Jump help switch.
      </p>
      <Gesture kind="run" how="Slide sideways" what="Run" sub="slide right to run right, left to run left. Slide the other way to turn around" />
      <Gesture kind="jump" how="Slide up and across" what="Run and jump" sub="while you run, keep sliding up and forward in one quick motion. This is how you cross gaps" />
      <Gesture kind="up" how="Flick up" what="Jump" sub="a quick flick, standing or running" />
      <Gesture kind="tap" how="Tap in the air" what="Double jump" sub="tap anywhere while you are in the air. It pushes you forward the way you face; slide the other way to brake. Or flick up again, or wiggle the thumb you are still steering with: down a little, then up" />
      <Gesture kind="down" how="Slide down" what="Duck" sub="hold it to stay low" />
      <div className="htp-tip">
        <span className="htp-tipicon" aria-hidden="true">
          <Icon name="bulb" size={22} />
        </span>
        <span>
          <b>Two thumbs:</b> run and jump with your left thumb, and use your right thumb for the attacks below. A jump wants a <b>quick</b> flick, not a long slide.
        </span>
      </div>
      <Gesture kind="tap" how="Tap" what="Punch" />
      <Gesture kind="flick" how={<>Quick flick <Arr d="l" /> <Arr d="r" /></>} what="Kick" sub="the way you flick is the way he kicks" />
      <Gesture kind="hold" how="Press and hold" what="Mega punch" sub="slower, but it hits hard" />
    </Section>
    )}
    {!short && (
    <Section title="Prefer buttons? Use the pad">
      <p className="ui-copy">
        In the <b>Menu</b>, set <b>Touch controls</b> to <b>Pad</b>. A thumb pad appears wherever you press on one side of the screen, and <b>Jump</b>, <b>Punch</b> and <b>Kick</b> buttons sit on the
        other. Left-handed? Flip the pad's side right there.
      </p>
      <Row how={<>Pad <Arr d="l" /> <Arr d="r" /></>} what="Run" />
      <Row how={<>Pad <Arr d="d" /> / <Arr d="u" /></>} what="Duck / jump" sub="hold up to climb a trunk or grab a rope" />
      <Row how="Jump" what="Jump" sub="hold for height, press again in the air for a double jump" />
      <Row how="Punch" what="Punch" sub="tap to punch, hold for a mega punch" />
      <Row how="Kick" what="Kick" />
    </Section>
    )}
    {(!short || !COARSE) && (
    <Section title="With a keyboard">
      <Row how={<><K>A</K> <K>D</K> or <K><Arr d="l" size={12} /></K> <K><Arr d="r" size={12} /></K></>} what="Run" />
      <Row how={<><K>W</K> <K><Arr d="u" size={12} /></K> or <K>Space</K></>} what="Jump" sub="press again in the air for a double jump" />
      <Row how={<><K>S</K> or <K><Arr d="d" size={12} /></K></>} what="Duck" />
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
          <b>The first time</b> you meet something new (a foe, a trunk to climb, a swinging vine, a bouncy mushroom and more), the game pauses and Pokey explains it once. A New Game shows them again. A game controller works too. <b>Tree trunks can be climbed</b>: jump into one and hold up. Once you clear stage 1-3 you learn the <b>Shimmy Rope</b>: jump up into a rope to grab it, run
          along it with <Arr d="l" /> <Arr d="r" />, and press down and jump to let go.
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
      <Row how={<Many name="heart" n={3} />} what="Hearts" sub="your health. A heart pick-up refills one" />
      <Row how="× 3" what="Lives" sub="lose every heart and a life goes. With none left the stage is over, and you can try it again" />
      <Row how={<Many name="star" n={1} />} what="Score" sub="fruit, flowers, leaves and every foe you beat add to it" />
    </Section>
    <Section title="Stars for a stage">
      <Row how={<Many name="star" n={1} />} what="One star" sub="for clearing the stage" />
      <Row how={<Many name="star" n={2} />} what="Two stars" sub="clear it with at least half your hearts left, or beat the target time" />
      <Row how={<Many name="star" n={3} />} what="Three stars" sub="lose no life, keep most of your hearts, and be quick (or collect nearly everything)" />
    </Section>
    <Section title="Pick-ups on the way">
      <Row how={<Icon name="bolt" size={24} />} what="Speed" sub="run faster for a while" />
      <Row how={<Icon name="shield" size={24} />} what="Invincible" sub="enemies cannot hurt you for a while" />
      <Row how={<Icon name="magnet" size={24} />} what="Magnet" sub="pulls nearby fruit, flowers and hearts to you" />
      <Row how={<Icon name="cage" size={24} />} what="Cages" sub="punch a cage to set the friend inside free" />
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
        An extra layer of finish: <b>trees and grass sway in the wind</b>, Pokey gets a <b>rim of sunlight and a soft shadow</b>, light shafts and drifting pollen move through the jungle, and the
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
              <div className="ui-kicker">{short ? 'Before you start' : 'Pokey says'}</div>
              <h2 className="ui-h2">How to Play</h2>
            </div>
          </div>
          <button type="button" className="ui-x" onClick={onClose} aria-label="Close">
            <Icon name="cross" size={14} />
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
