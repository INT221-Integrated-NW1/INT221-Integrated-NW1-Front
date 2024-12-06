<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        default: "",
    },
    confirmText: {
        type: String,
        default: "Confirm",
    },
    cancelText: {
        type: String,
        default: "Cancel",
    },
    action: {
        type: String,
        default: 'default',
    },
});

const emit = defineEmits(["close", "confirm"]);

const onCancel = () => {
    emit("close", props.action);
};

const onConfirm = () => {
    emit("confirm", props.action);
};
</script>

<template>
    <div>
        <transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
                <div class="tbkk-modal-alert relative p-6 bg-white w-full max-w-[34em] m-auto flex-col flex rounded-lg">
                    <header v-if="title" class="mb-4">
                        <h2 class="text-xl font-bold text-black">{{ title }}</h2>
                    </header>
                    <div class="mb-4 text-black">
                        <slot name="content">
                            <p class="itbkk-message">{{ message }}</p>
                        </slot>
                    </div>
                    <div class="flex justify-end gap-3">
                        <button v-if="confirmText"
                        class="itbkk-button-confirm px-6 py-4 rounded-lg bg-green-600 hover:bg-green-500 border-0 hover:scale-105 duration-150 text-white" @click="onConfirm">
                            {{ confirmText }}
                        </button>
                        <button v-if="cancelText" class="itbkk-button-cancel px-6 py-4 rounded-lg bg-red-500 hover:bg-red-600 border-0 hover:scale-105 duration-150 text-white"
                            @click="onCancel">
                            {{ cancelText }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.bg-smoke-light {
    background-color: rgba(0, 0, 0, 0.5);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>