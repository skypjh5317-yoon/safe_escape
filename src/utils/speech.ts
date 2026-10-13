/**
 * Web Speech API wrapper for emergency disaster audio announcements in Korean.
 */

export interface SpeechBroadcasterOptions {
  lang?: 'ko-KR' | 'ja-JP';
  rate?: number;
  pitch?: number;
  volume?: number;
  repeat?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

class SpeechBroadcaster {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private repeatTimer: number | null = null;
  private currentText = '';
  private currentOptions: SpeechBroadcasterOptions = {};

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) || v.lang === lang);
    return voice || null;
  }

  public speak(text: string, options: SpeechBroadcasterOptions = {}) {
    if (!this.isSupported()) {
      options.onError?.(new Error('Speech Synthesis not supported in this browser.'));
      return;
    }

    this.stop();
    this.currentText = text;
    this.currentOptions = options;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      const targetLang = options.lang ?? 'ko-KR';
      utter.lang = targetLang;
      utter.rate = options.rate ?? 0.95;
      utter.pitch = options.pitch ?? 1.0;
      utter.volume = options.volume ?? 1.0;

      const voice = this.getVoiceForLang(targetLang);
      if (voice) {
        utter.voice = voice;
      }

      utter.onstart = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      utter.onend = () => {
        this.isSpeaking = false;
        options.onEnd?.();

        if (options.repeat) {
          this.repeatTimer = window.setTimeout(() => {
            if (options.repeat && this.currentText) {
              this.speak(this.currentText, options);
            }
          }, 2000);
        }
      };

      utter.onerror = (e) => {
        this.isSpeaking = false;
        options.onError?.(e);
      };

      this.utterance = utter;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      this.isSpeaking = false;
      options.onError?.(e);
    }
  }

  public stop() {
    if (this.repeatTimer) {
      clearTimeout(this.repeatTimer);
      this.repeatTimer = null;
    }
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // cleanup
      }
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechBroadcaster = new SpeechBroadcaster();

export const EMERGENCY_BROADCAST_SCRIPTS = {
  ko: {
    earthquake: {
      title: '지진 대피 긴급 경보 방송 (한국어)',
      summary: '규모 6.2 지진 감지 - 즉시 탁자 밑 낙하물 보호 및 야외 공터 대피',
      script: '긴급재난경보를 발령합니다. 지진이 발생하였습니다. ' +
        '즉시 머리를 보호하고 탁자 아래로 몸을 숨기십시오! ' +
        '흔들림이 멈출 때까지 자리를 지키고, 진동이 멈춘 후 침착하게 계단을 이용하여 ' +
        '건물 밖 운동장이나 넓은 공터 대피소로 이동하십시오. ' +
        '엘리베이터 이용은 절대 금지합니다. 가스와 전기를 차단하고 문을 열어 탈출구를 확보하십시오.',
    },
    volcano: {
      title: '화산 분화 긴급 경보 방송 (한국어)',
      summary: '화산재 및 분출물 확산 경보 - 호흡기 차단 및 복합방재 대피소 이동',
      script: '긴급재난경보를 발령합니다. 인근 화산이 분화하여 화산재와 유독가스가 확산 중입니다! ' +
        '즉시 KF94 마스크와 보안경을 착용하여 호흡기와 눈을 보호하십시오. ' +
        '실내에서는 문과 창문을 밀폐하고 틈새를 젖은 수건으로 막으십시오. ' +
        '안내되는 가까운 복합방재 대피시설로 신속히 이동하시고, 라디오와 재난 방송을 계속 청취하십시오.',
    },
  },
  ja: {
    earthquake: {
      title: '緊急地震速報・避難放送 (日本語)',
      summary: '強い揺れを感知 - 頭部を保護し机の下へ、揺れ収まり次第広域避難場所へ',
      script: '緊急地震速報です。大きな地震が発生しました。 ' +
        '直ちに頭部を保護し、丈夫な机の下に身を隠してください！ ' +
        '揺れが収まるまで慌てて外に飛び出さず、エレベーターは絶対に使用しないでください。 ' +
        '火の元を確認し、避難経路を確保した上で、指定緊急避難場所へ落ち着いて避難してください。',
    },
    volcano: {
      title: '緊急噴火速報・火山灰避難放送 (日本語)',
      summary: '噴火警報発令 - マスクとゴーグル着用、コンクリート退避舎へ避難',
      script: '緊急噴火警報です。付近の火山が噴火し、火山灰および有毒ガスが拡散しています！ ' +
        '直ちに防塵マスクとゴーグルを着用し、呼吸器と目を保護してください。 ' +
        '屋内の窓と換気口を密閉し、頑丈な指定退避舎または屋内避難所へ避難してください。',
    },
  },
};

