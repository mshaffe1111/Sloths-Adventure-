"""Names, facing and sizes for every usable cell of Matt's 18 story sheets.

spec per cell:  name[:facing][:flag]   facing: l (looks left in the sheet) | r (looks right) | 0 (front or unclear, never flipped for it)
                flag: b = the picture is cut off at the bottom (a bust, drawn with a soft fade)   raw = an opaque picture, not a cut-out
                '-' = leave the cell out
"""

# sheet -> dict(atlas, code, cells, ref, target)   ref = (cell number 1..16 of a standing figure, target height in atlas px) or None
S = {}


def sheet(n, atlas, code, cells, ref=None, scale=None):
    S[n] = dict(atlas=atlas, code=code, cells=cells.split(), ref=ref, scale=scale)


# ───────────── Pokey ─────────────
sheet(1, 'pokey', 'face',
      'grin:0:b beam:0:b aghast:0:b smug:0:b sulk:0:b fret:0:b snarl:0:b giggle:0:b weary:0:b plead:0:b glare:0:b delight:0:b drowsy:0:b doubt:0:b shock:0:b sly:0:b',
      scale=1.0)
sheet(2, 'pokey', 'pk',
      'leap_joy cheer_fist:r twirl laugh stomp_angry:l arms_crossed fume holler hand_on_chest content happy_tears starry_hands dizzy_spin stagger sit_stunned sit_puzzled',
      ref=(6, 205))
sheet(3, 'pokey', 'pk',
      'sneak:l peek_wall:r listen point_up:r panic dash:r halt shush curl_sad trudge:r slump_wall:r sob determined hips hold_arm walk_unsure:r',
      ref=(14, 205))
sheet(4, 'pokey', 'pk',
      'hum muse whistle sing_teary box_sit_smile box_sit_wind box_sit_dream box_ear swing_look_up:r swing_sing:r sing_stars sing_heart sing_wide sing_joy open_calm bow_head',
      ref=(15, 205))
sheet(13, 'pokey', 'pk',
      'chair_window:l chair_wait chair_chin window_reach:l pace_a:r door_lean knees - desk_write_a:r desk_write_b:r tag_up read_note carve_wall:l bright_idea scratch_head startled',
      ref=(16, 205))
sheet(14, 'pokey', 'pk',
      '- - - open_hands pace_b:r stand_wait - keyhole:l - - shrug explain - cheeks_worry - -',
      ref=(16, 205))

# ───────────── Meeca ─────────────
MEECA = 'idle glance look_up wave walk_a:r walk_b:r run_a:r run_b:r laugh giggle_hands cry sniffle sing_chest sing_reach yawn curl_sleep'
sheet(10, 'pair', 'mc', MEECA, ref=(1, 190))
sheet(11, 'pair', 'mb', MEECA, ref=(1, 190))
sheet(12, 'pair', 'mx',
      'sit_chin head_bow:0:b puzzled:0:b kneel_sad:r kneel_reach:l hold_dot hold_dot_b dot_whisper read_a read_cry petal_glow:r petal_wrist bell:0:b wipe_tear:0:b hand_heart:0:b stand:r',
      ref=(16, 190))

# ───────────── Pokey and Meeca together ─────────────
DUO_A = 'kneel_tie tie_closeup:0:raw tie_stand shake_a shake_b reach_slump side_by_side fists comfort hug_cry lean_rest lean_sad flower_kneel flower_pray photo_share photo_look'
sheet(7, 'pair', 'da', DUO_A, ref=(8, 205))
sheet(8, 'pair', 'db', DUO_A, ref=(8, 205))
sheet(9, 'pair', 'hug',
      'stand_smile hug_a hug_b sit_hug lift_hug stand_close hug_c spin_hug arm_around nuzzle sit_forehead hug_wraps cheek_glad heart_hands hug_d lie_lean',
      ref=(6, 205))

# ───────────── the General (a mandrill in these sheets) ─────────────
sheet(6, 'folk', 'gn',
      'ready_a:r ready_b:r ready_c:r crack_spark:r crack_b:r crack_c:r armor_off:r bare_sorrow:r tunic_club_a:r tunic_club_b:r tunic_club_c:r tunic_club_d:r tunic_sad_a:r tunic_sad_b:r tunic_sad_c:r tunic_stand:r',
      ref=(16, 250))
sheet(5, 'folk', 'gv',
      'stand stoop kneel_think:r crouch_low:r sit_knees sit_read:r kneel_read:r kneel_fold:r reach_a:r reach_b:r gentle wipe_eye wave hand_heart walk_away:r look_up:r',
      ref=(1, 245))
sheet(16, 'folk', 'gy',
      'stand stand_b:r salute:r smile walk_a:r offer_hand:r laugh_hips music_box hold_baby kneel_reach:r wave turn_away:l window_room:0:raw stoop:r fists slump',
      ref=(1, 250))

# ───────────── Grandma, Lt. Pell, the crier and the mail carrier ─────────────
sheet(15, 'folk', 'gr',
      'stand_hands look_up:r water:l petals:l box_sit hum_sit wave_talk rocker laugh arms_wide kneel_pray:r tea_chair point:l giggle hand_chest wave',
      ref=(1, 185))
sheet(17, 'folk', 'lp',
      'stand_worry turn_away:l lantern_walk:r lantern_look:r bow:r cap_in_hand:r salute_a salute_nervous peek_door:r tray_walk:r tray_crouch:r hands_clasped sew_table mend_coat shrug hopeful',
      ref=(1, 200))
sheet(18, 'folk', 'tc',
      'hat_stand hat_shout scroll announce bell_scroll point_bell:r ear_listen bow_hat - - - - - - - -',
      ref=(3, 170))
# the mail carrier shares sheet 18 (the lower two rows): its own code and scale
S[1800] = dict(atlas='folk', code='po', sheet=18, cells=('- - - - - - - - carry_walk:r carry_stand lean_pole wave_parcel read_parcel walk_parcel:r offer_parcel coat_stand').split(), ref=(10, 205), scale=None)
