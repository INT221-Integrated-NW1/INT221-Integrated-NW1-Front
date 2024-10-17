<script setup>
const props = defineProps({
    show: Boolean,
    title: {
        type: String,
        default: 'Confirm Action',
    },
    message: {
        type: String,
        default: 'Are you sure ?',
    }
});

// ส่ง event กลับไปที่ component หลัก
const emit = defineEmits(['confirm', 'close']);
// Method ปิด modal
const close = () => emit('close');
const confirm = () => emit('confirm');
</script>

<template>
    <div class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 flex justify-center items-center text-white scale-125 z-[100]"
        v-if="show">
        <div class="bg-gray-800 p-4 rounded-lg w-96 border-[4px] border-[#37373D]">
            <h3 class="text-[#FFC745] font-bold text-lg ">Confirm Visibility Change</h3>
            <hr>
            <div class="text-center overflow-hidden">
                <p class="mb-6">
                    Do you want to change board visibility to
                    <strong>{{ message }}</strong> ?
                </p>
            </div>
            <div class="flex justify-center">
                <button
                    class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                    @click="confirm">Confirm</button>
                <button
                    class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                    @click="close">Cancel</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
